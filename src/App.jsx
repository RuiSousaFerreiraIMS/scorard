import { useEffect, useState } from 'react';
import HomeScreen from './screens/HomeScreen.jsx';
import SetupScreen from './screens/SetupScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import ResultsScreen from './screens/ResultsScreen.jsx';
import HistoryScreen from './screens/HistoryScreen.jsx';
import {
  createSession,
  appendRound,
  undoRound,
  finishSession,
} from './core/session';
import {
  saveActive,
  loadActive,
  clearActive,
  loadHistory,
  addToHistory,
} from './core/storage';
import { shareResult } from './core/share';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [gameId, setGameId] = useState(null);
  const [session, setSession] = useState(null);
  const [active, setActive] = useState(null); // sessão retomável (só p/ Home)
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

  const goHome = () => {
    setActive(loadActive());
    setHistory(loadHistory());
    setScreen('home');
  };

  const pickGame = (id) => {
    setGameId(id);
    setScreen('setup');
  };

  const startGame = (players, setup) => {
    const s = createSession(gameId, players, setup);
    persist(s);
    setActive(null);
    setScreen('game');
  };

  const submitRound = (input) => persist(appendRound(session, input));
  const undo = () => persist(undoRound(session));

  const resumeGame = () => {
    const saved = loadActive();
    if (saved) {
      setGameId(saved.gameId);
      setSession(saved);
      setActive(null);
      setScreen('game');
    }
  };

  const finishGame = () => {
    const done = finishSession(session);
    addToHistory(done);
    clearActive();
    setSession(done);
    setActive(null);
    setHistory(loadHistory());
    setScreen('results');
  };

  const newGameSameGroup = () => {
    // recomeça com o mesmo jogo; o Setup pré-preenche os jogadores do jogo anterior
    setGameId(session.gameId);
    setScreen('setup');
  };

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          onPickGame={pickGame}
          activeSession={active}
          onResume={resumeGame}
          historyCount={history.length}
          onHistory={() => setScreen('history')}
        />
      )}

      {screen === 'setup' && (
        <SetupScreen
          gameId={gameId}
          initialPlayers={session && session.gameId === gameId ? session.players : null}
          onStart={startGame}
          onBack={goHome}
        />
      )}

      {screen === 'game' && session && (
        <GameScreen
          session={session}
          onSubmitRound={submitRound}
          onUndo={undo}
          onFinish={finishGame}
          onBack={goHome}
        />
      )}

      {screen === 'results' && session && (
        <ResultsScreen
          session={session}
          onNewGame={newGameSameGroup}
          onHome={goHome}
          onShare={() => shareResult(session)}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen
          history={history}
          onBack={goHome}
          onShare={(s) => shareResult(s)}
        />
      )}
    </>
  );
}
