// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { listGames } from '../core/gameRegistry';
import { Card, Eyebrow } from '../components/ui';
import { theme, space } from '../core/theme';

export default function HomeScreen({ onPickGame, resumeSession, onResume }) {
  const games = listGames();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Eyebrow>Contas de jogo</Eyebrow>
      <Text style={styles.title}>CardScore</Text>
      <Text style={styles.subtitle}>Escolhe o jogo. As contas fazem-se sozinhas.</Text>
      {resumeSession && (
        <TouchableOpacity onPress={onResume} activeOpacity={0.85}>
          <Card style={styles.resumeCard}>
            <Eyebrow>Em curso</Eyebrow>
            <Text style={styles.resumeText}>Retomar {resumeSession.gameName}</Text>
            <Text style={styles.resumeDim}>
              {resumeSession.playerCount} jogadores · ronda {resumeSession.roundIndex + 1}
            </Text>
          </Card>
        </TouchableOpacity>
      )}
      <View style={{ height: space.lg }} />
      <Eyebrow>Jogos</Eyebrow>
      <View style={{ height: space.sm }} />
      {games.map((g) => (
        <TouchableOpacity key={g.id} onPress={() => onPickGame(g.id)} activeOpacity={0.85}>
          <Card style={styles.gameCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameName}>{g.name}</Text>
              <Text style={styles.gameDesc}>{g.description}</Text>
              <Text style={styles.gameMeta}>{g.minPlayers}–{g.maxPlayers} jogadores</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Card>
        </TouchableOpacity>
      ))}
      <View style={{ height: space.xl }} />
      <Text style={styles.footer}>Mais jogos em breve.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, paddingTop: space.xl, paddingBottom: space.xl * 2 },
  title: { color: theme.text, fontSize: 40, fontWeight: '800', marginTop: space.xs },
  subtitle: { color: theme.textDim, fontSize: 15, marginTop: space.xs, marginBottom: space.lg },
  resumeCard: { borderColor: theme.goldDim, backgroundColor: theme.surfaceAlt },
  resumeText: { color: theme.gold, fontSize: 18, fontWeight: '700', marginTop: 4 },
  resumeDim: { color: theme.textDim, fontSize: 13, marginTop: 2 },
  gameCard: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  gameName: { color: theme.text, fontSize: 20, fontWeight: '700' },
  gameDesc: { color: theme.textDim, fontSize: 14, marginTop: 3 },
  gameMeta: { color: theme.goldDim, fontSize: 12, marginTop: 6, fontWeight: '600' },
  arrow: { color: theme.gold, fontSize: 30, fontWeight: '300', marginLeft: space.sm },
  footer: { color: theme.textDim, fontSize: 13, textAlign: 'center' },
});
