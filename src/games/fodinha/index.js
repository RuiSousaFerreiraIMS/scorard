// src/games/fodinha/index.js
//
// FODINHA
// - 2 a 20 jogadores
// - cada ronda vale X (valor inicial definido no setup)
// - quem PERDE paga o valor da ronda; o total pago divide-se pelos que ganham
// - ronda perfeita (ninguem perde) -> ninguem paga e o valor sobe no incremento
// - sequencia de cartas: 1,2,3,4,5,4,3,2,1 (so informativa)
// - jogo termina quando o utilizador decidir (isFinished sempre false)
//
// Nota: a lógica de dinheiro é a mesma da versão Expo, mas agora o estado é
// SEMPRE derivado dos rounds (event sourcing). createState/applyRound são puros
// e não guardam history[] — isso é reconstruído pelo core a partir dos rounds.

import { formatEuro } from '../../core/format';
import RoundInput from './RoundInput.jsx';

const CARD_SEQUENCE = [1, 2, 3, 4, 5, 4, 3, 2, 1];
function cardsForRound(roundIndex) {
  return CARD_SEQUENCE[roundIndex % CARD_SEQUENCE.length];
}

const fodinha = {
  id: 'fodinha',
  name: 'Fodinha',
  description: 'Apostas por ronda, contas de dinheiro automáticas.',
  minPlayers: 2,
  maxPlayers: 20,
  RoundInput,

  setupFields: [
    { key: 'baseValue', label: 'Valor da ronda (€)', type: 'number', default: 1 },
    { key: 'increment', label: 'Aumento por ronda perfeita (€)', type: 'number', default: 1 },
  ],

  createState(players, setup) {
    const baseValue = Number(setup.baseValue) || 1;
    const increment = Number(setup.increment) || 1;
    return {
      baseValue,
      increment,
      currentValue: baseValue,
      roundIndex: 0,
      balances: players.map((p) => ({ playerId: p.id, name: p.name, money: 0 })),
    };
  },

  getRoundConfig(state) {
    const cards = cardsForRound(state.roundIndex);
    return {
      label: `Ronda ${state.roundIndex + 1} · ${cards} carta${cards > 1 ? 's' : ''}`,
      helper: `Valor desta ronda: ${formatEuro(state.currentValue)}`,
      value: state.currentValue,
      cards,
    };
  },

  applyRound(state, input) {
    const loserIds = input.loserIds || [];
    const value = state.currentValue;
    const all = state.balances;
    const winners = all.filter((b) => !loserIds.includes(b.playerId));
    const losers = all.filter((b) => loserIds.includes(b.playerId));
    const perfect = losers.length === 0;
    const newBalances = all.map((b) => ({ ...b }));

    if (!perfect && winners.length > 0) {
      const pot = losers.length * value;
      const share = pot / winners.length;
      for (const b of newBalances) {
        if (loserIds.includes(b.playerId)) b.money -= value;
        else b.money += share;
      }
    }
    const nextValue = perfect ? value + state.increment : state.baseValue;
    return {
      ...state,
      currentValue: nextValue,
      roundIndex: state.roundIndex + 1,
      balances: newBalances,
    };
  },

  isFinished() {
    return false;
  },

  getStandings(state) {
    return [...state.balances]
      .sort((a, b) => b.money - a.money)
      .map((b) => ({
        playerId: b.playerId,
        name: b.name,
        score: b.money,
        scoreLabel: formatEuro(b.money),
      }));
  },

  // Resumo de uma ronda para o histórico (comum a todos os jogos).
  roundSummary(input) {
    const n = (input.loserIds || []).length;
    if (n === 0) return 'ronda perfeita';
    return `${n} ${n > 1 ? 'perderam' : 'perdeu'}`;
  },
};

export const _internals = { cardsForRound, CARD_SEQUENCE };
export default fodinha;
