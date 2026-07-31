import { describe, it, expect } from 'vitest';
import fodinha, { _internals } from './index.js';

const players = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Bea' },
  { id: 'c', name: 'Caz' },
  { id: 'd', name: 'Dux' },
];
const setup = { baseValue: 1, increment: 1 };

function money(state) {
  return Object.fromEntries(state.balances.map((b) => [b.playerId, b.money]));
}

describe('fodinha — contas de dinheiro', () => {
  it('sequência de cartas sobe e desce: 1,2,3,4,5,4,3,2,1', () => {
    const seq = Array.from({ length: 9 }, (_, i) => _internals.cardsForRound(i));
    expect(seq).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1]);
  });

  it('depois do 1 volta a subir — nunca repete o 1', () => {
    // rondas 9..17 (índices 8..16): 1, depois sobe outra vez até 5 e desce
    const seq = Array.from({ length: 17 }, (_, i) => _internals.cardsForRound(i));
    expect(seq).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1]);
    // nunca há dois números iguais seguidos
    for (let i = 1; i < seq.length; i++) expect(seq[i]).not.toBe(seq[i - 1]);
  });

  it('um perdedor paga o valor, o pote divide pelos vencedores', () => {
    const s0 = fodinha.createState(players, setup);
    const s1 = fodinha.applyRound(s0, { loserIds: ['d'] });
    const m = money(s1);
    expect(m.d).toBeCloseTo(-1);
    // pote = 1, dividido por 3 vencedores
    expect(m.a).toBeCloseTo(1 / 3);
    expect(m.b).toBeCloseTo(1 / 3);
    expect(m.c).toBeCloseTo(1 / 3);
    // soma zero
    const total = Object.values(m).reduce((x, y) => x + y, 0);
    expect(total).toBeCloseTo(0);
  });

  it('dois perdedores: pote = 2 dividido por 2 vencedores', () => {
    const s0 = fodinha.createState(players, setup);
    const s1 = fodinha.applyRound(s0, { loserIds: ['c', 'd'] });
    const m = money(s1);
    expect(m.c).toBeCloseTo(-1);
    expect(m.d).toBeCloseTo(-1);
    expect(m.a).toBeCloseTo(1);
    expect(m.b).toBeCloseTo(1);
  });

  it('ronda perfeita: ninguém paga e o valor sobe pelo incremento', () => {
    const s0 = fodinha.createState(players, setup);
    const s1 = fodinha.applyRound(s0, { loserIds: [] });
    expect(money(s1)).toEqual({ a: 0, b: 0, c: 0, d: 0 });
    expect(s1.currentValue).toBe(2); // 1 + increment 1
  });

  it('valor volta ao base depois de uma ronda não-perfeita', () => {
    let s = fodinha.createState(players, setup);
    s = fodinha.applyRound(s, { loserIds: [] }); // perfeita -> valor 2
    expect(s.currentValue).toBe(2);
    s = fodinha.applyRound(s, { loserIds: ['a'] }); // valor da ronda é 2
    expect(s.currentValue).toBe(1); // volta ao base
    expect(money(s).a).toBeCloseTo(-2);
  });

  it('perfeitas seguidas acumulam o incremento', () => {
    let s = fodinha.createState(players, setup);
    s = fodinha.applyRound(s, { loserIds: [] }); // -> 2
    s = fodinha.applyRound(s, { loserIds: [] }); // -> 3
    s = fodinha.applyRound(s, { loserIds: [] }); // -> 4
    expect(s.currentValue).toBe(4);
  });

  it('standings ordenados do mais rico ao mais pobre', () => {
    const s0 = fodinha.createState(players, setup);
    const s1 = fodinha.applyRound(s0, { loserIds: ['d'] });
    const st = fodinha.getStandings(s1);
    expect(st[st.length - 1].playerId).toBe('d');
    expect(st[0].score).toBeGreaterThan(0);
  });

  it('roundSummary descreve a ronda', () => {
    expect(fodinha.roundSummary({ loserIds: [] })).toBe('ronda perfeita');
    expect(fodinha.roundSummary({ loserIds: ['a'] })).toBe('1 perdeu');
    expect(fodinha.roundSummary({ loserIds: ['a', 'b'] })).toBe('2 perderam');
  });
});
