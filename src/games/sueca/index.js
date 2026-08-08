// src/games/sueca/index.js
//
// SUECA — 4 jogadores, 2 duplas (quem se senta em frente joga junto).
//
// Regras de pontuação usadas (as mais correntes em Portugal):
//   as 40 cartas valem 120 pontos ao todo (Ás 11, Sete 10, Rei 4, Valete 3, Dama 2)
//   60–60 .......... empate, não conta
//   61 a 90 ........ 1 jogo
//   91 a 119 ....... 2 jogos
//   120 (capote) ... 4 jogos
// A partida ganha-se aos jogos combinados no início (por omissão, 4).
//
// A app não conta as cartas por ti — tu contas os pontos da vaza como sempre e
// escreves o número. Daí para a frente é tudo automático.

import RoundInput from './RoundInput.jsx';

export const TOTAL_POINTS = 120;

export function jogosFromPoints(points) {
  const p = Number(points) || 0;
  if (p >= TOTAL_POINTS) return 4; // capote
  if (p >= 91) return 2;
  if (p >= 61) return 1;
  return 0; // 60–60: empate
}

const sueca = {
  id: 'sueca',
  name: 'Sueca',
  description: 'Duplas, trunfo e capotes. Os jogos contam-se sozinhos.',
  suit: '♦',
  minPlayers: 4,
  maxPlayers: 4,
  difficulty: 'Média',
  longDescription:
    'O clássico português: 4 jogadores, 2 duplas, quem se senta em frente joga ' +
    'junto. Cada mão vale 120 pontos e ganha quem fizer mais de 60. Tu contas os ' +
    'pontos das cartas; a app trata dos jogos, dos capotes e de quem ganha a partida.',
  curiosity:
    'O capote — levar as 120 — vale por si só uma partida inteira de 4 jogos. Daí ' +
    'valer a pena arriscar quando se tem trunfo a mais.',
  rules: [
    { h: 'Duplas', p: 'Joga-se 2 contra 2. Os parceiros sentam-se em frente um do outro.' },
    { h: 'Pontos das cartas', p: 'Ás 11, Sete 10, Rei 4, Valete 3, Dama 2. As restantes não valem. Ao todo, 120.' },
    { h: 'Quanto vale a mão', p: '61 a 90 = 1 jogo · 91 a 119 = 2 jogos · 120 (capote) = 4 jogos. 60–60 é empate.' },
    { h: 'Fim da partida', p: 'Ganha a dupla que chegar primeiro aos jogos combinados (por omissão, 4).' },
  ],
  RoundInput,

  setupFields: [
    { key: 'gamesToWin', label: 'Jogos para ganhar a partida', type: 'number', default: 4 },
    { key: 'valuePerGame', label: 'Valor por jogo (€, 0 = sem dinheiro)', type: 'number', default: 0 },
  ],

  createState(playersInput, setup) {
    const gamesToWin = Number(setup.gamesToWin) || 4;
    const valuePerGame = Number(setup.valuePerGame) || 0;
    const [p1, p2, p3, p4] = playersInput;
    return {
      gamesToWin,
      valuePerGame,
      players: playersInput.map((p) => ({ id: p.id, name: p.name })),
      // parceiros sentam-se em frente: 1+3 contra 2+4
      teams: [
        { index: 0, name: `${p1.name} e ${p3.name}`, playerIds: [p1.id, p3.id], jogos: 0 },
        { index: 1, name: `${p2.name} e ${p4.name}`, playerIds: [p2.id, p4.id], jogos: 0 },
      ],
      roundIndex: 0,
    };
  },

  getRoundConfig(state) {
    return {
      label: `Mão ${state.roundIndex + 1}`,
      helper: `Primeira dupla a ${state.gamesToWin} jogos ganha`,
    };
  },

  applyRound(state, input) {
    const jogos = jogosFromPoints(input.points);
    const teams = state.teams.map((t) =>
      t.index === input.winnerTeam ? { ...t, jogos: t.jogos + jogos } : { ...t },
    );
    return { ...state, teams, roundIndex: state.roundIndex + 1 };
  },

  isFinished(state) {
    return state.teams.some((t) => t.jogos >= state.gamesToWin);
  },

  getStandings(state) {
    return [...state.teams]
      .sort((a, b) => b.jogos - a.jogos)
      .map((t) => ({
        playerId: `team${t.index}`,
        name: t.name,
        score: t.jogos,
        scoreLabel: `${t.jogos} ${t.jogos === 1 ? 'jogo' : 'jogos'}`,
        tone: t.jogos >= state.gamesToWin ? 'gold' : 'dim',
      }));
  },

  // Dinheiro só se tiver sido combinado um valor por jogo.
  // Paga-se a diferença de jogos entre as duas duplas, por jogador.
  getSettlement(state) {
    const v = state.valuePerGame;
    if (!v || !sueca.isFinished(state)) return [];

    const [t0, t1] = state.teams;
    const diff = Math.abs(t0.jogos - t1.jogos);
    if (diff === 0) return [];
    const amount = diff * v;
    const winners = t0.jogos > t1.jogos ? t0 : t1;
    const losers = winners === t0 ? t1 : t0;

    const nameOf = (id) => state.players.find((p) => p.id === id)?.name || '?';
    return [
      ...winners.playerIds.map((id) => ({ playerId: id, name: nameOf(id), amount })),
      ...losers.playerIds.map((id) => ({ playerId: id, name: nameOf(id), amount: -amount })),
    ];
  },

  roundSummary(input, index, playersList) {
    const jogos = jogosFromPoints(input.points);
    if (jogos === 0) return `empate 60–60`;
    // as duplas derivam-se da ordem dos jogadores, igual ao createState
    const names =
      input.winnerTeam === 0
        ? `${playersList[0].name} e ${playersList[2].name}`
        : `${playersList[1].name} e ${playersList[3].name}`;
    const capote = jogos === 4 ? ' (capote!)' : '';
    return `${names} · ${input.points} pts · +${jogos}${capote}`;
  },
};

export default sueca;
