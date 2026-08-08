// src/games/king/index.js
//
// KING — 4 jogadores, baralho de 52 cartas (13 a cada um).
//
// O jogo tem 10 mãos: primeiro as 6 NEGATIVAS (foge-se dos pontos) e depois as
// 4 POSITIVAS (fazem-se vazas para ganhar pontos). Cada negativa joga-se uma vez.
//
//   NEGATIVAS                              por unidade   total da mão
//   Vazas ................ cada vaza            −20          −260
//   Copas ................ cada copa            −20          −260
//   Mulheres ............. cada dama            −50          −200
//   Homens ............... rei ou valete        −30          −240
//   King ................. rei de copas        −160          −160
//   2 últimas ............ cada uma             −90          −180
//                                                          = −1300
//
//   POSITIVAS (4 mãos)  ... cada vaza           +25          +325
//                                                          = +1300
//
// As duas colunas anulam-se: um jogo completo soma zero entre os quatro. É por
// isso que ganha quem tiver MAIS pontos no fim.
//
// Regras conforme a versão portuguesa (pt.wikipedia.org/wiki/King_(jogo_de_cartas)),
// com a ordem que o Rui joga: negativas primeiro, positivas no fim.

import RoundInput from './RoundInput.jsx';

export const CONTRACTS = [
  { key: 'vazas', name: 'Vazas', type: 'neg', per: -20, total: 13, unit: 'vazas', help: 'Foge de fazer vazas. Cada uma tira 20.' },
  { key: 'copas', name: 'Copas', type: 'neg', per: -20, total: 13, unit: 'copas', help: 'Cada copa que apanhes tira 20.' },
  { key: 'damas', name: 'Mulheres', type: 'neg', per: -50, total: 4, unit: 'damas', help: 'As 4 damas. Cada uma tira 50.' },
  { key: 'homens', name: 'Homens', type: 'neg', per: -30, total: 8, unit: 'reis e valetes', help: 'Os 4 reis e os 4 valetes. Cada um tira 30.' },
  { key: 'king', name: 'King', type: 'neg', per: -160, total: 1, unit: 'rei de copas', help: 'Quem apanhar o rei de copas leva −160.' },
  { key: 'ultimas', name: '2 últimas', type: 'neg', per: -90, total: 2, unit: 'últimas vazas', help: 'As duas últimas vazas da mão. Cada uma tira 90.' },
];

export const POSITIVA = {
  key: 'positiva',
  name: 'Positiva',
  type: 'pos',
  per: 25,
  total: 13,
  unit: 'vazas',
  help: 'Agora é ao contrário: cada vaza dá 25.',
};

export const POSITIVAS_NO_JOGO = 4;
export const TOTAL_RONDAS = CONTRACTS.length + POSITIVAS_NO_JOGO; // 10

export function getContract(key) {
  return key === POSITIVA.key ? POSITIVA : CONTRACTS.find((c) => c.key === key) || null;
}

// O que ainda falta jogar. Enquanto houver negativas, só se mostram negativas.
export function remainingContracts(state) {
  const jogadas = state.done || [];
  const negFaltam = CONTRACTS.filter((c) => !jogadas.includes(c.key));
  if (negFaltam.length > 0) return negFaltam;
  const positivasFeitas = jogadas.filter((k) => k === POSITIVA.key).length;
  return positivasFeitas < POSITIVAS_NO_JOGO ? [POSITIVA] : [];
}

const king = {
  id: 'king',
  name: 'King',
  description: 'Dez mãos: seis a fugir dos pontos, quatro a apanhá-los.',
  suit: '♣',
  minPlayers: 4,
  maxPlayers: 4,
  difficulty: 'Difícil',
  longDescription:
    'Dez mãos em dois tempos. Primeiro as seis negativas, em que se foge das ' +
    'vazas, das copas, das damas, dos homens, do rei de copas e das duas últimas. ' +
    'Depois as quatro positivas, em que cada vaza passa a valer pontos. A app sabe ' +
    'quanto vale cada mão e o que ainda falta jogar.',
  curiosity:
    'As duas metades do jogo anulam-se: as negativas tiram 1300 pontos e as ' +
    'positivas dão os mesmos 1300. No fim, os quatro jogadores somam exatamente ' +
    'zero — se as contas não fecharem, houve engano algures.',
  rules: [
    { h: 'O jogo', p: '4 jogadores, 10 mãos: 6 negativas primeiro, depois 4 positivas.' },
    { h: 'Negativas', p: 'Vazas −20 cada · Copas −20 cada · Damas −50 cada · Reis e valetes −30 cada · Rei de copas −160 · 2 últimas vazas −90 cada.' },
    { h: 'Positivas', p: 'Nas 4 últimas mãos, cada vaza vale +25.' },
    { h: 'Quem ganha', p: 'Ganha quem tiver MAIS pontos no fim. A soma dos quatro dá sempre zero.' },
  ],
  RoundInput,

  setupFields: [
    { key: 'valuePerPoint', label: 'Valor por ponto (€, 0 = sem dinheiro)', type: 'number', default: 0 },
  ],

  createState(playersInput, setup) {
    return {
      valuePerPoint: Number(setup.valuePerPoint) || 0,
      players: playersInput.map((p) => ({ id: p.id, name: p.name })),
      scores: playersInput.map((p) => ({ playerId: p.id, name: p.name, pts: 0 })),
      done: [],
      roundIndex: 0,
    };
  },

  getRoundConfig(state) {
    return {
      label: `Mão ${Math.min(state.roundIndex + 1, TOTAL_RONDAS)} de ${TOTAL_RONDAS}`,
      helper: state.done.length < CONTRACTS.length ? 'Negativas' : 'Positivas',
    };
  },

  applyRound(state, input) {
    const contract = getContract(input.contract);
    if (!contract) return state;
    const scores = state.scores.map((p) => ({
      ...p,
      pts: p.pts + (Number(input.counts?.[p.playerId]) || 0) * contract.per,
    }));
    return {
      ...state,
      scores,
      done: [...state.done, contract.key],
      roundIndex: state.roundIndex + 1,
    };
  },

  isFinished(state) {
    return state.done.length >= TOTAL_RONDAS;
  },

  getStandings(state) {
    const sorted = [...state.scores].sort((a, b) => b.pts - a.pts); // mais pontos primeiro
    return sorted.map((p, i) => ({
      playerId: p.playerId,
      name: p.name,
      score: p.pts,
      scoreLabel: `${p.pts > 0 ? '+' : ''}${p.pts}`,
      tone: i === 0 ? 'gold' : p.pts < 0 ? 'neg' : 'dim',
    }));
  },

  // Como a soma dá zero, o dinheiro sai direto dos pontos.
  getSettlement(state) {
    const v = state.valuePerPoint;
    if (!v || !king.isFinished(state)) return [];
    return state.scores.map((p) => ({
      playerId: p.playerId,
      name: p.name,
      amount: p.pts * v,
    }));
  },

  roundSummary(input, index, playersList) {
    const contract = getContract(input.contract);
    if (!contract) return `mão ${index + 1}`;
    const counts = input.counts || {};
    const pior = playersList
      .map((p) => ({ name: p.name, n: Number(counts[p.id]) || 0 }))
      .sort((a, b) => b.n - a.n)[0];
    if (!pior || pior.n === 0) return contract.name;
    return contract.type === 'neg'
      ? `${contract.name} · ${pior.name} apanhou ${pior.n}`
      : `${contract.name} · ${pior.name} fez ${pior.n}`;
  },
};

export default king;
