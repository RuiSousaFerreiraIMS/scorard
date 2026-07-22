// src/screens/ResultsScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getGame } from '../core/gameRegistry';
import { Button, Card, Eyebrow } from '../components/ui';
import { theme, space } from '../core/theme';

export default function ResultsScreen({ gameId, state, onNewGame, onHome }) {
  const game = getGame(gameId);
  const standings = game.getStandings(state);
  const rounds = state.history ? state.history.length : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Eyebrow>Fim de jogo</Eyebrow>
      <Text style={styles.title}>Contas finais</Text>
      <Text style={styles.sub}>{game.name} · {rounds} rondas</Text>
      <View style={{ height: space.lg }} />
      {standings.map((p, i) => {
        const isTop = i === 0;
        return (
          <Card key={p.playerId} style={[styles.row, isTop && styles.rowTop]}>
            <Text style={[styles.rank, isTop && { color: theme.gold }]}>{i + 1}</Text>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={[styles.money,
              { color: p.score > 0 ? theme.positive : p.score < 0 ? theme.negative : theme.textDim }]}>
              {p.scoreLabel}
            </Text>
          </Card>
        );
      })}
      <View style={{ height: space.xl }} />
      <Button title="Novo jogo" onPress={onNewGame} />
      <View style={{ height: space.sm }} />
      <Button title="Menu principal" variant="ghost" onPress={onHome} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, paddingTop: space.xl, paddingBottom: space.xl * 2 },
  title: { color: theme.text, fontSize: 34, fontWeight: '800', marginTop: space.xs },
  sub: { color: theme.textDim, fontSize: 15, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  rowTop: { borderColor: theme.gold, backgroundColor: theme.surfaceAlt },
  rank: { color: theme.textDim, fontSize: 20, fontWeight: '800', width: 36 },
  name: { color: theme.text, fontSize: 18, fontWeight: '600', flex: 1 },
  money: { fontSize: 18, fontWeight: '800' },
});
