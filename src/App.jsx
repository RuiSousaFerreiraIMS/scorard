import { useEffect, useState } from 'react';
import AppShell from './ui/AppShell.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import SetupScreen from './screens/SetupScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import ResultsScreen from './screens/ResultsScreen.jsx';
import HistoryScreen from './screens/HistoryScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import SharedView from './screens/SharedView.jsx';
import { getGame } from './core/gameRegistry';
import { readShareHash } from './core/shareLink';
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
} from './core/storage';
import { shareResult, shareSessionLink } from './core/share';

export default function App() {
  // Se o URL trouxer uma sessão partilhada (#s=...), mostra a vista só-de-leitura
  // e não arranca a app normal (não toca no storage do visitante).
  const [shared] = useState(() => readShareHash());

  // Navegação: separador (tab) + fluxo de jogo (flow) sobreposto ao separador Jogar.
  const [tab, setTab] = useState('jogar'); // jogar | historico | perfil
  const [flow, setFlow] = useState(null); // null | setup | game | results
  const [gameId, setGameId] = useState(null);
  const [session, setSession] = useState(null);
  const [active, setActive] = useState(null); // sessão retomável
  const [history, setHistory] = useState([]);

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
      const done = finishSession(next);
      addToHistory(done);
      clearActive();
      setSession(done);
      setActive(null);
      setHistory(loadHistory());
      setFlow('results');
    }
  };
  const undo = () => persist(undoRound(session));

  const removeHistory = (id) => {
    removeFromHistory(id);
    setHistory(loadHistory());
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

  const finishGame = () => {
    const done = finishSession(session);
    addToHistory(done);
    clearActive();
    setSession(done);
    setActive(null);
    setHistory(loadHistory());
    setFlow('results');
  };

  const newGameSameGroup = () => {
    setGameId(session.gameId);
    setFlow('setup');
  };

  if (shared) return <SharedView data={shared} />;

  let content = null;
  if (flow === 'setup') {
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
        onPickGame={pickGame}
        activeSession={active}
        onResume={resumeGame}
      />
    );
  }

  return (
    <AppShell tab={tab} onTab={changeTab} showTabBar={flow === null}>
      {content}
    </AppShell>
  );
}
