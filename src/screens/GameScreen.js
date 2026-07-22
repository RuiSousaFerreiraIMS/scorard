// src/screens/GameScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getGame } from '../core/gameRegistry';
import { Button, Card, Eyebrow } from '../components/ui';
import { theme, space, radius } from '../core/theme';

export default function GameScreen({ gameId, state, onChange, onFinish, onBack }) {
  const game = getGame(gameId);
  const [selected, setSelected] = useState([]);

  const round = game.getRoundConfig(state);
  const standings = game.getStandings(state);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const confirmRound = () => {
    const next = game.applyRound(state, { loserIds: selected });
    setSelected([]); onChange(next);
  };
  const perfect = selected.length === 0;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹ Menu</Text></TouchableOpacity>
        <Card style={styles.roundCard}>
          <Eyebrow>{round.label}</Eyebrow>
          <Text style={styles.roundValue}>{formatValue(round.value)}</Text>
          <Text style={styles.roundHelper}>
            {perfect ? 'Ninguém marcado → ronda perfeita, valor sobe'
              : `${selected.length} a perder · cada um paga ${formatValue(round.value)}`}
          </Text>
        </Card>
        <View style={{ height: space.lg }} />
        <Eyebrow>Quem perdeu esta ronda?</Eyebrow>
        <Text style={styles.hint}>Toca em quem perdeu. Os restantes ganham.</Text>
        <View style={{ height: space.sm }} />
        {standings.slice().sort((a, b) => a.name.localeCompare(b.name)).map((p) => {
          const isLoser = selected.includes(p.playerId);
          return (
            <TouchableOpacity key={p.playerId} onPress={() => toggle(p.playerId)} activeOpacity={0.8}>
              <View style={[styles.playerRow, isLoser && styles.playerRowLoser]}>
                <View style={[styles.checkbox, isLoser && styles.checkboxOn]}>
                  {isLoser && <Text style={styles.checkmark}>−</Text>}
                </View>
                <Text style={styles.playerName}>{p.name}</Text>
                <Text style={[styles.playerMoney,
                  { color: p.score > 0 ? theme.positive : p.score < 0 ? theme.negative : theme.textDim }]}>
                  {p.scoreLabel}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: space.lg }} />
        <Button title={perfect ? 'Registar ronda perfeita' : 'Registar ronda'} onPress={confirmRound} />
        <View style={{ height: space.sm }} />
        <Button title="Terminar jogo" variant="danger" onPress={() =>
          Alert.alert('Terminar jogo', 'Mostrar as contas finais?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Terminar', style: 'destructive', onPress: onFinish },
          ])} />
        {state.history.length > 0 && (
          <>
            <View style={{ height: space.lg }} />
            <Eyebrow>Histórico</Eyebrow>
            <View style={{ height: space.sm }} />
            {state.history.slice().reverse().map((h) => (
              <View key={h.round} style={styles.histRow}>
                <Text style={styles.histRound}>R{h.round}</Text>
                <Text style={styles.histDetail}>
                  {h.cards} carta{h.cards > 1 ? 's' : ''} · {formatValue(h.value)}
                </Text>
                <Text style={styles.histResult}>
                  {h.perfect ? 'perfeita' : `${h.loserIds.length} perdeu${h.loserIds.length > 1 ? 'ram' : ''}`}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function formatValue(n) { return `${Number(n).toFixed(2)} €`; }

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: space.lg, paddingTop: space.xl, paddingBottom: space.xl * 2 },
  back: { color: theme.gold, fontSize: 16, marginBottom: space.md },
  roundCard: { alignItems: 'center', backgroundColor: theme.surfaceAlt, borderColor: theme.goldDim },
  roundValue: { color: theme.gold, fontSize: 44, fontWeight: '800', marginVertical: 4 },
  roundHelper: { color: theme.textDim, fontSize: 14, textAlign: 'center' },
  hint: { color: theme.textDim, fontSize: 13, marginTop: 4 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border, borderRadius: radius.md, padding: space.md, marginBottom: space.sm },
  playerRowLoser: { borderColor: theme.negative, backgroundColor: '#241A18' },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: theme.border,
    marginRight: space.md, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { borderColor: theme.negative, backgroundColor: theme.negative },
  checkmark: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 24 },
  playerName: { color: theme.text, fontSize: 17, fontWeight: '600', flex: 1 },
  playerMoney: { fontSize: 16, fontWeight: '700' },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: theme.border },
  histRound: { color: theme.gold, fontWeight: '700', width: 40 },
  histDetail: { color: theme.textDim, flex: 1 },
  histResult: { color: theme.text, fontSize: 13 },
});
