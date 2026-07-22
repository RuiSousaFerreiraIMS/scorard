// App.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import GameScreen from './src/screens/GameScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import { getGame } from './src/core/gameRegistry';
import { saveActive, loadActive, clearActive } from './src/core/storage';
import { theme } from './src/core/theme';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [gameId, setGameId] = useState(null);
  const [state, setState] = useState(null);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    (async () => {
      const saved = await loadActive();
      if (saved && saved.gameId && saved.state && !saved.state.finished) {
        const g = getGame(saved.gameId);
        if (g) setResume({
          gameId: saved.gameId, gameName: g.name,
          playerCount: saved.state.balances.length, roundIndex: saved.state.roundIndex,
        });
      }
    })();
  }, []);

  const persist = (gid, st) => saveActive({ gameId: gid, state: st });
  const pickGame = (id) => { setGameId(id); setScreen('setup'); };

  const startGame = (players, setup) => {
    const g = getGame(gameId);
    const st = g.createState(players, setup);
    setState(st); persist(gameId, st); setScreen('game');
  };
  const updateState = (st) => { setState(st); persist(gameId, st); };

  const finishGame = () => {
    const g = getGame(gameId);
    const st = g.finish ? g.finish(state) : { ...state, finished: true };
    setState(st); clearActive(); setScreen('results');
  };

  const resumeGame = () => {
    (async () => {
      const saved = await loadActive();
      if (saved) { setGameId(saved.gameId); setState(saved.state); setResume(null); setScreen('game'); }
    })();
  };

  const goHome = () => {
    setScreen('home');
    (async () => {
      const saved = await loadActive();
      if (saved && saved.state && !saved.state.finished) {
        const g = getGame(saved.gameId);
        setResume({ gameId: saved.gameId, gameName: g.name,
          playerCount: saved.state.balances.length, roundIndex: saved.state.roundIndex });
      } else setResume(null);
    })();
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.inner}>
          {screen === 'home' && (
            <HomeScreen onPickGame={pickGame} resumeSession={resume} onResume={resumeGame} />
          )}
          {screen === 'setup' && (
            <SetupScreen gameId={gameId} onStart={startGame} onBack={goHome} />
          )}
          {screen === 'game' && state && (
            <GameScreen gameId={gameId} state={state} onChange={updateState}
              onFinish={finishGame} onBack={goHome} />
          )}
          {screen === 'results' && state && (
            <ResultsScreen gameId={gameId} state={state}
              onNewGame={() => setScreen('setup')} onHome={goHome} />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  inner: { flex: 1, backgroundColor: theme.bg },
});
