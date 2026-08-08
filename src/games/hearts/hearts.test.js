import { describe, it, expect } from 'vitest';
import hearts, { HAND_TOTAL, applyMoon } from './index.js';

const players = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Bea' },
  { id: 'c', name: 'Caz' },
  { id: 'd', name: 'Dux' },
];
const setup = { targetScore: 100, valuePerPoint: 0 };
const state0 = () => hearts.createState(players, setup);

describe('hearts — pontuação de uma mão', () => {
  it('uma mão vale 26 pontos (13 copas + a dama de espadas)', () => {
    expect(HAND_TOTAL).toBe(26);
  });

  it('soma os pontos de cada um (quem tem menos é que ganha)', () => {
    const s = hearts.applyRound(state0(), { points: { a: 0, b: 13, c: 8, d: 5 } });
    const by = Object.fromEntries(s.scores.map((p) => [p.playerId, p.pts]));
    expect(by).toEqual({ a: 0, b: 13, c: 8, d: 5 });
  });

  it('acumula ao longo das mãos', () => {
    let s = state0();
    s = hearts.applyRound(s, { points: { a: 0, b: 13, c: 8, d: 5 } });
    s = hearts.applyRound(s, { points: { a: 10, b: 0, c: 16, d: 0 } });
    const by = Object.fromEntries(s.scores.map((p) => [p.playerId, p.pts]));
    expect(by.a).toBe(10);
    expect(by.c).toBe(24);
  });
});

describe('hearts — fazer o pleno (shoot the moon)', () => {
  it('quem faz o pleno fica a zero e os outros levam 26', () => {
    const pts = applyMoon(players, 'b');
    expect(pts).toEqual({ a: 26, b: 0, c: 26, d: 26 });
  });

  it('o pleno aplicado a uma mão real', () => {
    const s = hearts.applyRound(state0(), { points: applyMoon(players, 'b'), moonBy: 'b' });
    const by = Object.fromEntries(s.scores.map((p) => [p.playerId, p.pts]));
    expect(by.b).toBe(0);
    expect(by.a).toBe(26);
  });
});

describe('hearts — fim de jogo', () => {
  it('acaba quando alguém chega aos pontos combinados', () => {
    let s = state0();
    expect(hearts.isFinished(s)).toBe(false);
    s = hearts.applyRound(s, { points: { a: 0, b: 100, c: 0, d: 0 } });
    expect(hearts.isFinished(s)).toBe(true);
  });

  it('ganha quem tem MENOS pontos', () => {
    let s = state0();
    s = hearts.applyRound(s, { points: { a: 4, b: 100, c: 0, d: 22 } });
    const st = hearts.getStandings(s);
    expect(st[0].name).toBe('Caz'); // 0 pontos
    expect(st[st.length - 1].name).toBe('Bea'); // 100
  });
});

describe('hearts — dinheiro (opcional)', () => {
  it('sem valor por ponto não há contas', () => {
    let s = state0();
    s = hearts.applyRound(s, { points: { a: 0, b: 100, c: 0, d: 0 } });
    expect(hearts.getSettlement(s)).toEqual([]);
  });

  it('cada um paga a diferença de pontos para o vencedor', () => {
    let s = hearts.createState(players, { targetScore: 100, valuePerPoint: 0.1 });
    s = hearts.applyRound(s, { points: { a: 10, b: 100, c: 0, d: 20 } });
    const st = hearts.getSettlement(s);
    const by = Object.fromEntries(st.map((x) => [x.playerId, x.amount]));
    // Caz ganhou com 0; os outros pagam (pts − 0) × 0,10 €
    expect(by.a).toBeCloseTo(-1);
    expect(by.b).toBeCloseTo(-10);
    expect(by.d).toBeCloseTo(-2);
    expect(by.c).toBeCloseTo(13); // recebe o que os outros pagam
    expect(st.reduce((t, x) => t + x.amount, 0)).toBeCloseTo(0);
  });
});
