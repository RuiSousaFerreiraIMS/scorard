// src/screens/SetupScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { getGame } from '../core/gameRegistry';
import { Button, Card, Eyebrow } from '../components/ui';
import { theme, space, radius } from '../core/theme';

let idCounter = 0;
const newPlayer = (name = '') => ({ id: `p${Date.now()}_${idCounter++}`, name });

export default function SetupScreen({ gameId, onStart, onBack }) {
  const game = getGame(gameId);
  const [players, setPlayers] = useState([newPlayer(''), newPlayer('')]);
  const [setup, setSetup] = useState(() => {
    const init = {};
    game.setupFields.forEach((f) => { init[f.key] = String(f.default); });
    return init;
  });

  const updatePlayer = (id, name) =>
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)));
  const addPlayer = () => { if (players.length < game.maxPlayers) setPlayers((ps) => [...ps, newPlayer('')]); };
  const removePlayer = (id) => {
    if (players.length > game.minPlayers) setPlayers((ps) => ps.filter((p) => p.id !== id));
  };

  const named = players.map((p, i) => ({ ...p, name: p.name.trim() || `Jogador ${i + 1}` }));
  const canStart = players.length >= game.minPlayers;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹ Voltar</Text></TouchableOpacity>
      <Eyebrow>Configurar</Eyebrow>
      <Text style={styles.title}>{game.name}</Text>
      <Eyebrow>Jogadores ({players.length})</Eyebrow>
      <View style={{ height: space.sm }} />
      {players.map((p, i) => (
        <View key={p.id} style={styles.playerRow}>
          <View style={styles.num}><Text style={styles.numText}>{i + 1}</Text></View>
          <TextInput style={styles.input} value={p.name}
            onChangeText={(t) => updatePlayer(p.id, t)}
            placeholder={`Jogador ${i + 1}`} placeholderTextColor={theme.textDim} />
          {players.length > game.minPlayers && (
            <TouchableOpacity onPress={() => removePlayer(p.id)} style={styles.remove}>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {players.length < game.maxPlayers && (
        <TouchableOpacity onPress={addPlayer} style={styles.addRow}>
          <Text style={styles.addText}>+ Adicionar jogador</Text>
        </TouchableOpacity>
      )}
      <View style={{ height: space.lg }} />
      <Eyebrow>Opções</Eyebrow>
      <View style={{ height: space.sm }} />
      {game.setupFields.map((f) => (
        <Card key={f.key} style={styles.optCard}>
          <Text style={styles.optLabel}>{f.label}</Text>
          <TextInput style={styles.optInput} value={setup[f.key]}
            onChangeText={(t) => setSetup((s) => ({ ...s, [f.key]: t }))} keyboardType="numeric" />
        </Card>
      ))}
      <View style={{ height: space.xl }} />
      <Button title="Começar jogo" disabled={!canStart} onPress={() => {
        const parsed = {};
        game.setupFields.forEach((f) => {
          parsed[f.key] = f.type === 'number' ? Number(setup[f.key]) : setup[f.key];
        });
        onStart(named, parsed);
      }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, paddingTop: space.xl, paddingBottom: space.xl * 2 },
  back: { color: theme.gold, fontSize: 16, marginBottom: space.md },
  title: { color: theme.text, fontSize: 32, fontWeight: '800', marginVertical: space.sm },
  playerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  num: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', marginRight: space.sm },
  numText: { color: theme.gold, fontWeight: '700' },
  input: { flex: 1, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 12, color: theme.text, fontSize: 16 },
  remove: { marginLeft: space.sm, padding: space.xs },
  removeText: { color: theme.danger, fontSize: 28, fontWeight: '300' },
  addRow: { paddingVertical: space.sm },
  addText: { color: theme.gold, fontSize: 15, fontWeight: '600' },
  optCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm },
  optLabel: { color: theme.text, fontSize: 15, flex: 1 },
  optInput: { backgroundColor: theme.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: space.md,
    paddingVertical: 8, color: theme.gold, fontSize: 18, fontWeight: '700', minWidth: 70, textAlign: 'center' },
});
