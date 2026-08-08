import { describe, it, expect } from 'vitest';
import king, { CONTRACTS, POSITIVA, POSITIVAS_NO_JOGO, remainingContracts } from './index.js';

const players = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Bea' },
  { id: 'c', name: 'Caz' },
  { id: 'd', name: 'Dux' },
];
const setup = { valuePerPoint: 0 };
const state0 = () => king.createState(players, setup);
const ptsOf = (s) => Object.fromEntries(s.scores.map((p) => [p.playerId, p.pts]));

describe('king — os contratos', () => {
  it('há 6 negativas e valem −1300 ao todo', () => {
    expect(CONTRACTS).toHaveLength(6);
    const soma = CONTRACTS.reduce((t, c) => t + c.per * c.total, 0);
    expect(soma).toBe(-1300);
  });

  it('cada negativa vale o que deve', () => {
    const by = Object.fromEntries(CONTRACTS.map((c) => [c.key, c]));
    expect(by.vazas).toMatchObject({ per: -20, total: 13 }); // −260
    expect(by.copas).toMatchObject({ per: -20, total: 13 }); // −260
    expect(by.damas).toMatchObject({ per: -50, total: 4 }); // −200
    expect(by.homens).toMatchObject({ per: -30, total: 8 }); // −240
    expect(by.king).toMatchObject({ per: -160, total: 1 }); // −160
    expect(by.ultimas).toMatchObject({ per: -90, total: 2 }); // −180
  });

  it('as 4 positivas valem +1300 ao todo', () => {
    expect(POSITIVA.per * POSITIVA.total * POSITIVAS_NO_JOGO).toBe(1300);
  });
});

describe('king — pontuação de uma ronda', () => {
  it('nas vazas, cada vaza tira 20', () => {
    const s = king.applyRound(state0(), {
      contract: 'vazas',
      counts: { a: 5, b: 4, c: 3, d: 1 },
    });
    expect(ptsOf(s)).toEqual({ a: -100, b: -80, c: -60, d: -20 });
  });

  it('o rei de copas tira 160 a quem o apanhar', () => {
    const s = king.applyRound(state0(), { contract: 'king', counts: { a: 0, b: 1, c: 0, d: 0 } });
    expect(ptsOf(s)).toEqual({ a: 0, b: -160, c: 0, d: 0 });
  });

  it('numa positiva, cada vaza dá 25', () => {
    const s = king.applyRound(state0(), {
      contract: 'positiva',
      counts: { a: 5, b: 4, c: 3, d: 1 },
    });
    expect(ptsOf(s)).toEqual({ a: 125, b: 100, c: 75, d: 25 });
  });
});

describe('king — ordem e fim do jogo', () => {
  it('só deixa escolher positivas depois de as negativas acabarem', () => {
    let s = state0();
    expect(remainingContracts(s).every((c) => c.type === 'neg')).toBe(true);
    for (const c of CONTRACTS) {
      s = king.applyRound(s, { contract: c.key, counts: { a: c.total, b: 0, c: 0, d: 0 } });
    }
    const restantes = remainingContracts(s);
    expect(restantes).toHaveLength(1);
    expect(restantes[0].key).toBe('positiva');
  });

  it('cada negativa só se joga uma vez', () => {
    const s = king.applyRound(state0(), {
      contract: 'vazas',
      counts: { a: 13, b: 0, c: 0, d: 0 },
    });
    expect(remainingContracts(s).some((c) => c.key === 'vazas')).toBe(false);
  });

  it('o jogo tem 10 rondas e acaba na décima', () => {
    let s = state0();
    for (const c of CONTRACTS) {
      s = king.applyRound(s, { contract: c.key, counts: { a: c.total, b: 0, c: 0, d: 0 } });
    }
    expect(king.isFinished(s)).toBe(false);
    for (let i = 0; i < POSITIVAS_NO_JOGO; i++) {
      expect(king.isFinished(s)).toBe(false);
      s = king.applyRound(s, { contract: 'positiva', counts: { a: 13, b: 0, c: 0, d: 0 } });
    }
    expect(s.roundIndex).toBe(10);
    expect(king.isFinished(s)).toBe(true);
  });

  it('jogo completo fecha a zero (negativas −1300 + positivas +1300)', () => {
    let s = state0();
    // reparte as contagens de maneira desigual, para não ser um caso trivial
    const reparte = (total) => {
      const base = [0, 0, 0, 0];
      for (let i = 0; i < total; i++) base[i % 4] += 1;
      return { a: base[0], b: base[1], c: base[2], d: base[3] };
    };
    for (const c of CONTRACTS) s = king.applyRound(s, { contract: c.key, counts: reparte(c.total) });
    for (let i = 0; i < POSITIVAS_NO_JOGO; i++) {
      s = king.applyRound(s, { contract: 'positiva', counts: reparte(POSITIVA.total) });
    }
    const total = s.scores.reduce((t, p) => t + p.pts, 0);
    expect(total).toBe(0);
  });

  it('ganha quem tiver MAIS pontos', () => {
    let s = state0();
    s = king.applyRound(s, { contract: 'vazas', counts: { a: 13, b: 0, c: 0, d: 0 } });
    const st = king.getStandings(s);
    expect(st[st.length - 1].name).toBe('Ana'); // levou −260, fica em último
  });
});
