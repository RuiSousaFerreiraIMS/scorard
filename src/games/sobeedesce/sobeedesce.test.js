import { describe, it, expect } from 'vitest';
import sobeedesce, { computeMultiplier, computeDeltas, _internals } from './index.js';

const players = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Bea' },
  { id: 'c', name: 'Caz' },
  { id: 'd', name: 'Dux' },
];
const setup = { valuePerPoint: 0.2 };

function state0(overrides = {}) {
  const s = sobeedesce.createState(players, setup);
  return { ...s, ...overrides };
}

// helper: constrói o input de uma ronda
function round({ mode = 'escolheu', suit = 'espadas', dark = false, went, tricks, chooserId = 'a' }) {
  const w = {};
  const t = {};
  for (const p of players) {
    w[p.id] = went[p.id] ?? false;
    t[p.id] = tricks[p.id] ?? 0;
  }
  return { chooserId, mode, suit, dark, went: w, tricks: t };
}

const allWent = { a: true, b: true, c: true, d: true };

describe('sobeedesce — multiplicador', () => {
  it('trunfo normal ×1, copas ×2, escuro ×3', () => {
    expect(computeMultiplier({ suit: 'espadas', dark: false })).toBe(1);
    expect(computeMultiplier({ suit: 'paus', dark: false })).toBe(1);
    expect(computeMultiplier({ suit: 'copas', dark: false })).toBe(2);
    expect(computeMultiplier({ suit: 'copas', dark: true })).toBe(3);
  });
});

describe('sobeedesce — casos de teste da spec (T1–T8)', () => {
  const D = (r) => computeDeltas(state0(), r);

  it('T1 — normal, quem escolheu faz vazas', () => {
    const r = round({ suit: 'espadas', went: allWent, tricks: { a: 2, b: 1, c: 2, d: 0 } });
    expect(D(r)).toEqual({ a: -2, b: -1, c: -2, d: 5 });
  });

  it('T2 — normal, quem escolheu falha', () => {
    const r = round({ suit: 'ouros', went: allWent, tricks: { a: 0, b: 2, c: 2, d: 1 } });
    expect(D(r)).toEqual({ a: 10, b: -2, c: -2, d: -1 });
  });

  it('T3 — vira trunfo e falha (D passou)', () => {
    const r = round({
      mode: 'virou',
      suit: 'espadas',
      went: { a: true, b: true, c: true, d: false },
      tricks: { a: 0, b: 3, c: 2 },
    });
    expect(D(r)).toEqual({ a: 5, b: -3, c: -2, d: 0 });
  });

  it('T4 — copas escolhida, quem escolheu falha', () => {
    const r = round({ suit: 'copas', went: allWent, tricks: { a: 0, b: 1, c: 3, d: 1 } });
    expect(D(r)).toEqual({ a: 20, b: -2, c: -6, d: -2 });
  });

  it('T5 — virou copas, falha', () => {
    const r = round({ mode: 'virou', suit: 'copas', went: allWent, tricks: { a: 0, b: 2, c: 2, d: 1 } });
    expect(D(r)).toEqual({ a: 10, b: -4, c: -4, d: -2 });
  });

  it('T6 — copas no escuro', () => {
    const r = round({ suit: 'copas', dark: true, went: allWent, tricks: { a: 1, b: 0, c: 3, d: 1 } });
    expect(D(r)).toEqual({ a: -3, b: 15, c: -9, d: -3 });
  });

  it('T7 — paus, todos obrigados', () => {
    const r = round({ suit: 'paus', went: allWent, tricks: { a: 2, b: 0, c: 2, d: 1 } });
    expect(D(r)).toEqual({ a: -2, b: 5, c: -2, d: -1 });
  });

  it('T8 — passa o zero e ganha', () => {
    const s = state0();
    s.scores.find((p) => p.playerId === 'a').pts = 3;
    const r = round({ suit: 'espadas', went: allWent, tricks: { a: 4, b: 1, c: 0, d: 0 } });
    const next = sobeedesce.applyRound(s, r);
    const a = next.scores.find((p) => p.playerId === 'a');
    expect(a.pts).toBe(-1);
    expect(sobeedesce.isFinished(next)).toBe(true);
    expect(next.winnerId).toBe('a');
  });
});

describe('sobeedesce — estado e obrigatoriedades', () => {
  it('createState: todos a 20, chooser 0', () => {
    const s = state0();
    expect(s.scores.every((p) => p.pts === 20)).toBe(true);
    expect(s.chooserIndex).toBe(0);
  });

  it('passStreak: passar incrementa, ir a jogo reinicia', () => {
    let s = state0();
    // D passa
    let r = round({ went: { a: true, b: true, c: true, d: false }, tricks: { a: 5 } });
    s = sobeedesce.applyRound(s, r);
    expect(s.scores.find((p) => p.playerId === 'd').passStreak).toBe(1);
    // D passa outra vez (chooser passa a ser B, mas D volta a passar)
    r = { chooserId: 'b', mode: 'escolheu', suit: 'espadas', dark: false,
          went: { a: true, b: true, c: true, d: false }, tricks: { a: 5 } };
    s = sobeedesce.applyRound(s, r);
    expect(s.scores.find((p) => p.playerId === 'd').passStreak).toBe(2);
    // D vai a jogo → reinicia
    r = { chooserId: 'c', mode: 'escolheu', suit: 'espadas', dark: false,
          went: { a: true, b: true, c: true, d: true }, tricks: { a: 2, b: 1, c: 1, d: 1 } };
    s = sobeedesce.applyRound(s, r);
    expect(s.scores.find((p) => p.playerId === 'd').passStreak).toBe(0);
  });

  it('forcedReason: chooser, paus, pts<=5, passou 2x', () => {
    const s = state0();
    const chooser = s.scores[0]; // a
    const draft = { chooserId: 'a', suit: 'espadas', dark: false };
    expect(_internals.forcedReason(chooser, draft, s)).toBeTruthy(); // é o chooser

    const paus = { chooserId: 'a', suit: 'paus', dark: false };
    expect(_internals.forcedReason(s.scores[1], paus, s)).toBeTruthy(); // paus

    const low = { ...s.scores[1], pts: 5 };
    expect(_internals.forcedReason(low, draft, s)).toBeTruthy(); // pts<=5

    const streak = { ...s.scores[1], passStreak: 2 };
    expect(_internals.forcedReason(streak, draft, s)).toBeTruthy(); // passou 2x

    const free = { ...s.scores[1], pts: 15, passStreak: 0 };
    expect(_internals.forcedReason(free, draft, s)).toBeNull();
  });
});

describe('sobeedesce — conta final em €', () => {
  it('vencedor recebe a soma; perdedores pagam pontos × valor', () => {
    // força um estado terminado: A=0 (vencedor), B=8, C=5, D=12
    const s = state0();
    s.scores[0].pts = 0;
    s.scores[1].pts = 8;
    s.scores[2].pts = 5;
    s.scores[3].pts = 12;
    s.finished = true;
    s.winnerId = 'a';
    const st = sobeedesce.getStandings(s);
    const byId = Object.fromEntries(st.map((x) => [x.playerId, x]));
    // 0,20 €/ponto: B 1.60, C 1.00, D 2.40; vencedor recebe 5.00
    expect(byId.b.detail).toContain('1.60');
    expect(byId.c.detail).toContain('1.00');
    expect(byId.d.detail).toContain('2.40');
    expect(byId.a.detail).toContain('5.00');
    // vencedor primeiro
    expect(st[0].playerId).toBe('a');
  });

  it('getSettlement: o vencedor recebe o que os outros pagam (fecha a zero)', () => {
    const s = state0();
    s.scores[0].pts = 0; // a — vencedor
    s.scores[1].pts = 8;
    s.scores[2].pts = 5;
    s.scores[3].pts = 12;
    s.finished = true;
    s.winnerId = 'a';
    const st = sobeedesce.getSettlement(s);
    const by = Object.fromEntries(st.map((x) => [x.playerId, x.amount]));
    expect(by.b).toBeCloseTo(-1.6);
    expect(by.c).toBeCloseTo(-1.0);
    expect(by.d).toBeCloseTo(-2.4);
    expect(by.a).toBeCloseTo(5.0);
    expect(st.reduce((t, x) => t + x.amount, 0)).toBeCloseTo(0);
  });

  it('getSettlement: jogo a decorrer não gera acerto', () => {
    expect(sobeedesce.getSettlement(state0())).toEqual([]);
  });

  it('empate a 0: quem não foi o primeiro não paga', () => {
    const s = state0();
    s.scores[0].pts = 0; // a
    s.scores[1].pts = -1; // b também chegou a 0/abaixo
    s.scores[2].pts = 7;
    s.scores[3].pts = 4;
    s.finished = true;
    s.winnerId = 'a'; // a foi o primeiro
    const st = sobeedesce.getStandings(s);
    const byId = Object.fromEntries(st.map((x) => [x.playerId, x]));
    expect(byId.b.detail).toMatch(/não paga/i);
  });
});
