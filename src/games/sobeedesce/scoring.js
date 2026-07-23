// Núcleo de pontuação do Sobe e Desce (puro, sem UI).
// Partilhado pelo módulo do jogo (index.js) e pelo input de ronda (RoundInput.jsx),
// para não haver lógica duplicada nem import circular.

export const START_POINTS = 20;

export const SUITS = [
  { k: 'paus', label: 'Paus', symbol: '♣', copas: false, note: 'todos vão' },
  { k: 'espadas', label: 'Espadas', symbol: '♠', copas: false },
  { k: 'ouros', label: 'Ouros', symbol: '♦', copas: false },
  { k: 'copas', label: 'Copas', symbol: '♥', copas: true, note: '×2' },
];

export function computeMultiplier(round) {
  if (round.dark) return 3;
  if (round.suit === 'copas') return 2;
  return 1;
}

// Deltas de pontos por jogador nesta ronda.
export function computeDeltas(state, round) {
  const M = computeMultiplier(round);
  const chooserId = round.chooserId ?? state.scores[state.chooserIndex]?.playerId;
  const deltas = {};
  for (const p of state.scores) {
    const went = round.went[p.playerId];
    if (went !== true) {
      deltas[p.playerId] = 0; // passou
      continue;
    }
    const t = round.tricks[p.playerId] || 0;
    if (t > 0) {
      deltas[p.playerId] = -(t * M); // fez vazas
      continue;
    }
    // foi a jogo e falhou (0 vazas)
    if (p.playerId === chooserId) {
      if (round.dark) deltas[p.playerId] = 15;
      else if (round.mode === 'escolheu') deltas[p.playerId] = round.suit === 'copas' ? 20 : 10;
      else deltas[p.playerId] = round.suit === 'copas' ? 10 : 5; // virou
    } else {
      deltas[p.playerId] = 5 * M;
    }
  }
  return deltas;
}

// Obrigatoriedade de ir a jogo (avisos na UI). Devolve string ou null.
export function forcedReason(scoreEntry, draft, state) {
  const chooserId = draft.chooserId ?? state.scores[state.chooserIndex]?.playerId;
  if (scoreEntry.playerId === chooserId) return 'está a escolher, vai sempre.';
  if (draft.suit === 'paus' && !draft.dark) return 'trunfo paus, todos vão.';
  if (scoreEntry.pts <= 5) return 'tem 5 pontos ou menos, obrigado a ir.';
  if (scoreEntry.passStreak >= 2) return 'passou 2× seguidas, obrigado a ir agora.';
  return null;
}
