import { useEffect, useState } from 'react';
import AppShell from './ui/AppShell.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import SetupScreen from './screens/SetupScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import ResultsScreen from './screens/ResultsScreen.jsx';
import HistoryScreen from './screens/HistoryScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import GameDetailScreen from './screens/GameDetailScreen.jsx';
import RulesScreen from './screens/RulesScreen.jsx';
import SharedView from './screens/SharedView.jsx';
import WelcomeScreen from './screens/WelcomeScreen.jsx';
import { getGame } from './core/gameRegistry';
import { readShareHash } from './core/shareLink';
import { loadFavorites, toggleFavorite, saveFavorites } from './core/favorites';
import { useAuth } from './core/useAuth';
import { syncOnLogin, pushFavorite, dropFavorite, pushSession, dropSession } from './core/cloud';
import {
  createSession,
  appendRound,
  undoRound,
  finishSession,
  deriveState,
} from './core/session';
import {
  saveActive,
  loadActive,
  clearActive,
  loadHistory,
  addToHistory,
  removeFromHistory,
  saveHistory,
} from './core/storage';
import { shareResult, shareSessionLink } from './core/share';

export default function App() {
  // Se o URL trouxer uma sessão partilhada (#s=...), mostra a vista só-de-leitura
  // e não arranca a app normal (não toca no storage do visitante).
  const [shared] = useState(() => readShareHash());

  // Navegação: separador (tab) + fluxo (flow) sobreposto ao separador Jogar.
  const [tab, setTab] = useState('jogar'); // jogar | historico | perfil
  const [flow, setFlow] = useState(null); // null | detail | rules | setup | game | results
  const [gameId, setGameId] = useState(null);
  const [detailId, setDetailId] = useState(null); // jogo aberto no detalhe/regras
  const [session, setSession] = useState(null);
  const [active, setActive] = useState(null); // sessão retomável
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState(() => loadFavorites());

  // Conta: quem ainda não entrou vê o ecrã de boas-vindas, a não ser que tenha
  // escolhido continuar sem conta.
  const { user, ready: authReady, hasSupabase } = useAuth();
  const [skippedAuth, setSkippedAuth] = useState(
    () => localStorage.getItem('scorard:skippedAuth') === '1',
  );
  const skipAuth = () => {
    try {
      localStorage.setItem('scorard:skippedAuth', '1');
    } catch {
      /* ignora */
    }
    setSkippedAuth(true);
  };

  // Ao entrar na conta: juntar o que está no telemóvel com o que está na cloud.
  // Se a cloud não responder, fica tudo como está (não se perde nada).
  useEffect(() => {
    if (!user) return undefined;
    let alive = true;
    (async () => {
      const res = await syncOnLogin(user.id, loadFavorites(), loadHistory());
      if (!alive || !res.ok) return;
      setFavorites(res.favorites);
      saveFavorites(res.favorites);
      setHistory(res.history);
      saveHistory(res.history);
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  // Arquivar um jogo terminado: telemóvel primeiro, cloud a seguir.
  const archive = async (done) => {
    addToHistory(done);
    clearActive();
    setSession(done);
    setActive(null);
    setHistory(loadHistory());
    setFlow('results');

    if (!user) return;
    const saved = await pushSession(user.id, done);
    if (!saved) return; // sem rede: fica local, sobe no próximo login
    // passa a usar o registo da cloud (id uuid), para apagar funcionar dos dois lados
    const merged = loadHistory().map((s) => (s.id === done.id ? saved : s));
    saveHistory(merged);
    setHistory(merged);
  };

  // Carregar sessão ativa + histórico ao arrancar.
  useEffect(() => {
    const saved = loadActive();
    if (saved && !saved.finishedAt) setActive(saved);
    setHistory(loadHistory());
  }, []);

  const persist = (s) => {
    setSession(s);
    saveActive(s);
  };

  const changeTab = (key) => {
    setActive(loadActive());
    setHistory(loadHistory());
    setFlow(null);
    setTab(key);
  };

  const goHome = () => changeTab('jogar');

  const openDetail = (id) => {
    setDetailId(id);
    setFlow('detail');
  };
  const toggleFav = (id) => {
    const next = toggleFavorite(id);
    setFavorites(next);
    if (user) {
      if (next.includes(id)) pushFavorite(user.id, id);
      else dropFavorite(user.id, id);
    }
  };

  const pickGame = (id) => {
    setGameId(id);
    setFlow('setup');
  };

  const startGame = (players, setup) => {
    const s = createSession(gameId, players, setup);
    persist(s);
    setActive(null);
    setFlow('game');
  };

  const submitRound = (input) => {
    const next = appendRound(session, input);
    persist(next);
    // fim de jogo automático (ex: Sobe e Desce chega a 0)
    const game = getGame(next.gameId);
    if (game.isFinished(deriveState(next, game))) {
      archive(finishSession(next));
    }
  };
  const undo = () => persist(undoRound(session));

  const removeHistory = (id) => {
    removeFromHistory(id);
    setHistory(loadHistory());
    if (user) dropSession(user.id, id);
  };

  const resumeGame = () => {
    const saved = loadActive();
    if (saved) {
      setGameId(saved.gameId);
      setSession(saved);
      setActive(null);
      setFlow('game');
    }
  };

  const finishGame = () => archive(finishSession(session));

  const newGameSameGroup = () => {
    setGameId(session.gameId);
    setFlow('setup');
  };

  // Link de sessão partilhada: nunca pede conta a quem só quer acompanhar.
  if (shared) return <SharedView data={shared} />;

  // Boas-vindas / conta, antes de entrar na app.
  if (hasSupabase && authReady && !user && !skippedAuth) {
    return <WelcomeScreen onSkip={skipAuth} />;
  }

  let content = null;
  if (flow === 'detail') {
    content = (
      <GameDetailScreen
        gameId={detailId}
        isFav={favorites.includes(detailId)}
        onToggleFav={toggleFav}
        onStart={pickGame}
        onRules={() => setFlow('rules')}
        onBack={() => setFlow(null)}
      />
    );
  } else if (flow === 'rules') {
    content = (
      <RulesScreen gameId={detailId} onBack={() => setFlow('detail')} onStart={pickGame} />
    );
  } else if (flow === 'setup') {
    content = (
      <SetupScreen
        gameId={gameId}
        initialPlayers={session && session.gameId === gameId ? session.players : null}
        onStart={startGame}
        onBack={goHome}
      />
    );
  } else if (flow === 'game' && session) {
    content = (
      <GameScreen
        session={session}
        onSubmitRound={submitRound}
        onUndo={undo}
        onFinish={finishGame}
        onBack={goHome}
        onShareLive={() => shareSessionLink(session)}
      />
    );
  } else if (flow === 'results' && session) {
    content = (
      <ResultsScreen
        session={session}
        onNewGame={newGameSameGroup}
        onHome={goHome}
        onShare={() => shareResult(session)}
        onShareLive={() => shareSessionLink(session)}
      />
    );
  } else if (tab === 'historico') {
    content = (
      <HistoryScreen
        history={history}
        onShare={(s) => shareResult(s)}
        onRemove={removeHistory}
      />
    );
  } else if (tab === 'perfil') {
    content = <ProfileScreen history={history} />;
  } else {
    content = (
      <HomeScreen
        onOpenDetail={openDetail}
        activeSession={active}
        onResume={resumeGame}
        favorites={favorites}
        onToggleFav={toggleFav}
        history={history}
      />
    );
  }

  return (
    <AppShell tab={tab} onTab={changeTab} showTabBar={flow === null}>
      {content}
    </AppShell>
  );
}
