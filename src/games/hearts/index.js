// src/games/hearts/index.js
//
// HEARTS (Copas) — 3 a 6 jogadores, o clássico em que se foge dos pontos.
//
//   cada copa .............. 1 ponto
//   dama de espadas ........ 13 pontos
//   total por mão .......... 26
//
// Ganha quem tiver MENOS pontos quando alguém chegar ao limite combinado (100
// por omissão). Quem apanhar as 26 sozinho faz o "pleno": fica a zero e são os
// outros que levam 26 cada.

import RoundInput from './RoundInput.jsx';

export const HAND_TOTAL = 26;

// Distribuição de pontos quando alguém faz o pleno.
export function applyMoon(players, moonPlayerId) {
  return Object.fromEntries(
    players.map((p) => [p.id, p.id === moonPlayerId ? 0 : HAND_TOTAL]),
  );
}

const hearts = {
  id: 'hearts',
  name: 'Copas',
  description: 'Foge dos pontos. Ganha quem tiver menos no fim.',
  suit: '♥',
  minPlayers: 3,
  maxPlayers: 6,
  difficulty: 'Fácil',
  longDescription:
    'O jogo em que ninguém quer fazer vazas: cada copa vale 1 ponto e a dama de ' +
    'espadas vale 13. Ganha quem tiver menos pontos quando alguém rebentar o ' +
    'limite. E há sempre o maluco que tenta apanhar tudo de uma vez.',
  curiosity:
    'Apanhar as 26 sozinho chama-se "fazer o pleno" — em vez de levares tudo, ficas ' +
    'a zero e são os outros que levam 26 cada. É a jogada mais arriscada do jogo.',
  rules: [
    { h: 'Objetivo', p: 'Fazer o MENOR número de pontos. Ganha quem tiver menos quando alguém chegar ao limite.' },
    { h: 'Pontos', p: 'Cada copa 1 ponto, dama de espadas 13. Ao todo, 26 por mão.' },
    { h: 'Pleno', p: 'Quem apanhar as 26 todas fica a zero e cada um dos outros leva 26.' },
    { h: 'Fim', p: 'Quando alguém chega ao limite combinado (100 por omissão), acaba. Ganha o mais baixo.' },
  ],
  RoundInput,

  setupFields: [
    { key: 'targetScore', label: 'Pontos que terminam o jogo', type: 'number', default: 100 },
    { key: 'valuePerPoint', label: 'Valor por ponto (€, 0 = sem dinheiro)', type: 'number', default: 0 },
  ],

  createState(playersInput, setup) {
    return {
      targetScore: Number(setup.targetScore) || 100,
      valuePerPoint: Number(setup.valuePerPoint) || 0,
      players: playersInput.map((p) => ({ id: p.id, name: p.name })),
      scores: playersInput.map((p) => ({ playerId: p.id, name: p.name, pts: 0 })),
      roundIndex: 0,
    };
  },

  getRoundConfig(state) {
    return {
      label: `Mão ${state.roundIndex + 1}`,
      helper: `Acaba aos ${state.targetScore} · ganha quem tiver menos`,
    };
  },

  applyRound(state, input) {
    const scores = state.scores.map((p) => ({
      ...p,
      pts: p.pts + (Number(input.points?.[p.playerId]) || 0),
    }));
    return { ...state, scores, roundIndex: state.roundIndex + 1 };
  },

  isFinished(state) {
    return state.scores.some((p) => p.pts >= state.targetScore);
  },

  getStandings(state) {
    const sorted = [...state.scores].sort((a, b) => a.pts - b.pts);
    return sorted.map((p, i) => ({
      playerId: p.playerId,
      name: p.name,
      score: p.pts,
      scoreLabel: `${p.pts} pts`,
      tone: i === 0 ? 'gold' : 'dim',
    }));
  },

  // Cada um paga a diferença de pontos para o vencedor; o vencedor recebe a soma.
  getSettlement(state) {
    const v = state.valuePerPoint;
    if (!v || !hearts.isFinished(state)) return [];

    const best = Math.min(...state.scores.map((p) => p.pts));
    const winner = state.scores.find((p) => p.pts === best);
    const pot = state.scores.reduce((sum, p) => sum + (p.pts - best) * v, 0);

    return state.scores.map((p) => ({
      playerId: p.playerId,
      name: p.name,
      amount: p.playerId === winner.playerId ? pot : -((p.pts - best) * v),
    }));
  },

  roundSummary(input, index, playersList) {
    if (input.moonBy) {
      const who = playersList.find((p) => p.id === input.moonBy);
      return `${who ? who.name : 'alguém'} fez o pleno!`;
    }
    const pts = input.points || {};
    const worst = playersList
      .map((p) => ({ name: p.name, n: Number(pts[p.id]) || 0 }))
      .sort((a, b) => b.n - a.n)[0];
    return worst && worst.n > 0 ? `${worst.name} apanhou ${worst.n}` : 'mão limpa';
  },
};

export default hearts;
