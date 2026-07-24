// src/games/sobeedesce/index.js
//
// SOBE E DESCE (4–5 jogadores)
// Segue à letra docs/sobe-e-desce-spec.md. Todos começam com 20 pontos; ganha
// quem chegar a 0 (ou abaixo). Cada ronda um jogador escolhe/vira o trunfo, que
// define o multiplicador M (normal ×1, copas ×2, copas no escuro ×3). Quem faz
// vazas tira vazas×M; quem falha leva penalização; quem passa fica a 0 na ronda.
// No fim, os pontos que sobram convertem-se em dinheiro.
//
// A pontuação pura vive em scoring.js (partilhada com o RoundInput).

import { formatEuro } from '../../core/format';
import RoundInput from './RoundInput.jsx';
import {
  SUITS,
  START_POINTS,
  computeMultiplier,
  computeDeltas,
  forcedReason,
} from './scoring.js';

const sobeedesce = {
  id: 'sobeedesce',
  name: 'Sobe e Desce',
  description: 'Vazas, trunfos e multiplicadores. Tudo automático.',
  suit: '♥',
  minPlayers: 4,
  maxPlayers: 5,
  difficulty: 'Média',
  longDescription:
    'Jogo de vazas ao estilo sueca. Todos começam com 20 pontos e o objetivo é ' +
    'chegar a 0. A cada ronda escolhe-se ou vira-se o trunfo, que define o ' +
    'multiplicador. A app trata dos multiplicadores, das obrigatoriedades e da ' +
    'conta final em euros.',
  curiosity:
    'O trunfo copas vale a dobrar, e "copas no escuro" — pedido antes de ver as ' +
    'cartas todas — vale a triplicar. É aí que os jogos se ganham... ou se perdem.',
  rules: [
    { h: 'Objetivo', p: 'Todos começam com 20 pontos. Ganha quem chegar a 0 (ou abaixo) primeiro.' },
    { h: 'Escolher ou virar', p: 'Um jogador por ronda escolhe o trunfo (arrisca mais) ou vira a carta (arrisca menos).' },
    { h: 'Multiplicador', p: 'Trunfo normal ×1, copas ×2, copas no escuro ×3.' },
    { h: 'Pontuação', p: 'Cada vaza feita tira vazas × multiplicador. Quem vai a jogo e falha, leva penalização.' },
    { h: 'Obrigatoriedades', p: 'Com paus todos vão; quem escolhe vai sempre; com 5 pontos ou menos é obrigado; não se passa 3× seguidas.' },
    { h: 'No fim', p: 'Os pontos que sobram convertem-se em dinheiro, ao valor por ponto combinado.' },
  ],
  RoundInput,

  setupFields: [
    { key: 'valuePerPoint', label: 'Valor por ponto (€)', type: 'number', default: 0.2 },
  ],

  createState(playersInput, setup) {
    const valuePerPoint = Number(setup.valuePerPoint) || 0.2;
    return {
      valuePerPoint,
      players: playersInput.map((p) => ({ id: p.id, name: p.name })),
      scores: playersInput.map((p) => ({
        playerId: p.id,
        name: p.name,
        pts: START_POINTS,
        passStreak: 0,
      })),
      chooserIndex: 0,
      roundIndex: 0,
      finished: false,
      winnerId: null,
    };
  },

  getRoundConfig(state) {
    const chooser = state.scores[state.chooserIndex];
    return {
      label: `Ronda ${state.roundIndex + 1}`,
      helper: chooser ? `${chooser.name} escolhe · ganha quem chega a 0` : '',
      chooserId: chooser?.playerId,
      chooserName: chooser?.name,
    };
  },

  applyRound(state, round) {
    const deltas = computeDeltas(state, round);
    const scores = state.scores.map((p) => {
      const went = round.went[p.playerId];
      const passStreak = went === true ? 0 : went === false ? p.passStreak + 1 : p.passStreak;
      return { ...p, pts: p.pts + deltas[p.playerId], passStreak };
    });

    let { finished, winnerId } = state;
    if (!finished) {
      const zeros = scores.filter((p) => p.pts <= 0);
      if (zeros.length > 0) {
        finished = true;
        if (zeros.length === 1) {
          winnerId = zeros[0].playerId;
        } else if (round.firstToZeroId && zeros.some((z) => z.playerId === round.firstToZeroId)) {
          winnerId = round.firstToZeroId; // desempate indicado pelo utilizador
        } else {
          winnerId = [...zeros].sort((a, b) => a.pts - b.pts)[0].playerId;
        }
      }
    }

    return {
      ...state,
      scores,
      chooserIndex: (state.chooserIndex + 1) % state.scores.length,
      roundIndex: state.roundIndex + 1,
      finished,
      winnerId,
    };
  },

  isFinished(state) {
    return !!state.finished;
  },

  getStandings(state) {
    const sorted = [...state.scores].sort((a, b) => a.pts - b.pts);

    if (!state.finished) {
      return sorted.map((p, i) => ({
        playerId: p.playerId,
        name: p.name,
        score: p.pts,
        scoreLabel: `${p.pts} pts`,
        tone: i === 0 ? 'gold' : 'dim',
      }));
    }

    // Jogo terminado → conta em dinheiro.
    const v = state.valuePerPoint;
    const others = state.scores.filter((p) => p.playerId !== state.winnerId);
    const pot = others.reduce((sum, p) => sum + (p.pts > 0 ? p.pts * v : 0), 0);

    return sorted.map((p) => {
      const isWinner = p.playerId === state.winnerId;
      let detail;
      let tone;
      if (isWinner) {
        detail = `recebe ${pot.toFixed(2)} €`;
        tone = 'gold';
      } else if (p.pts > 0) {
        detail = `paga ${(p.pts * v).toFixed(2)} €`;
        tone = 'neg';
      } else {
        detail = 'não paga (chegou a 0)';
        tone = 'dim';
      }
      return {
        playerId: p.playerId,
        name: p.name,
        score: p.pts,
        scoreLabel: `${p.pts} pts`,
        detail,
        tone,
      };
    });
  },

  roundSummary(round, index, playersList) {
    const chooser = playersList.find((p) => p.id === round.chooserId);
    const suit = SUITS.find((s) => s.k === round.suit);
    const suitTxt = round.dark
      ? '♥ escuro'
      : suit
        ? `${suit.symbol} ${suit.label.toLowerCase()}`
        : '';
    const modeTxt = round.mode === 'virou' ? 'virou' : 'escolheu';
    return `${chooser ? chooser.name : '?'} ${modeTxt} ${suitTxt}`;
  },
};

// Re-exporta o núcleo puro para testes e para o RoundInput.
export { computeMultiplier, computeDeltas, SUITS };
export const _internals = { forcedReason, START_POINTS };
export default sobeedesce;
