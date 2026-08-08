import { describe, it, expect } from 'vitest';
import sueca, { jogosFromPoints } from './index.js';

const players = [
  { id: 'a', name: 'Ana' }, // dupla A (com Caz)
  { id: 'b', name: 'Bea' }, // dupla B (com Dux)
  { id: 'c', name: 'Caz' },
  { id: 'd', name: 'Dux' },
];
const setup = { gamesToWin: 4, valuePerGame: 0 };
const state0 = () => sueca.createState(players, setup);

describe('sueca — quantos jogos vale uma mão', () => {
  it('60-60 é empate: não conta', () => {
    expect(jogosFromPoints(60)).toBe(0);
  });

  it('61 a 90 vale 1 jogo', () => {
    expect(jogosFromPoints(61)).toBe(1);
    expect(jogosFromPoints(75)).toBe(1);
    expect(jogosFromPoints(90)).toBe(1);
  });

  it('91 a 119 vale 2 jogos', () => {
    expect(jogosFromPoints(91)).toBe(2);
    expect(jogosFromPoints(119)).toBe(2);
  });

  it('120 (capote) vale 4 jogos', () => {
    expect(jogosFromPoints(120)).toBe(4);
  });
});

describe('sueca — pontuação da partida', () => {
  it('duplas formadas por quem se senta em frente (1+3 vs 2+4)', () => {
    const s = state0();
    expect(s.teams[0].playerIds).toEqual(['a', 'c']);
    expect(s.teams[1].playerIds).toEqual(['b', 'd']);
    expect(s.teams[0].name).toBe('Ana e Caz');
  });

  it('soma os jogos à dupla que ganhou a mão', () => {
    let s = state0();
    s = sueca.applyRound(s, { winnerTeam: 0, points: 75 }); // 1 jogo
    expect(s.teams[0].jogos).toBe(1);
    expect(s.teams[1].jogos).toBe(0);
    s = sueca.applyRound(s, { winnerTeam: 1, points: 95 }); // 2 jogos
    expect(s.teams[1].jogos).toBe(2);
  });

  it('empate não dá jogos a ninguém', () => {
    const s = sueca.applyRound(state0(), { winnerTeam: 0, points: 60 });
    expect(s.teams[0].jogos).toBe(0);
    expect(s.teams[1].jogos).toBe(0);
  });

  it('capote pode ganhar a partida de uma vez', () => {
    const s = sueca.applyRound(state0(), { winnerTeam: 1, points: 120 });
    expect(s.teams[1].jogos).toBe(4);
    expect(sueca.isFinished(s)).toBe(true);
  });

  it('a partida acaba ao chegar aos jogos combinados', () => {
    let s = state0();
    expect(sueca.isFinished(s)).toBe(false);
    s = sueca.applyRound(s, { winnerTeam: 0, points: 91 }); // 2
    expect(sueca.isFinished(s)).toBe(false);
    s = sueca.applyRound(s, { winnerTeam: 0, points: 91 }); // 4 → acabou
    expect(sueca.isFinished(s)).toBe(true);
    expect(sueca.getStandings(s)[0].name).toBe('Ana e Caz');
  });
});

describe('sueca — dinheiro (opcional)', () => {
  it('sem valor por jogo não há contas', () => {
    const s = sueca.applyRound(state0(), { winnerTeam: 0, points: 120 });
    expect(sueca.getSettlement(s)).toEqual([]);
  });

  it('com valor por jogo, quem perde paga a diferença a cada vencedor', () => {
    let s = sueca.createState(players, { gamesToWin: 4, valuePerGame: 0.5 });
    s = sueca.applyRound(s, { winnerTeam: 0, points: 91 }); // A: 2 jogos
    s = sueca.applyRound(s, { winnerTeam: 0, points: 91 }); // A: 4 jogos → fim
    const st = sueca.getSettlement(s);
    const by = Object.fromEntries(st.map((x) => [x.playerId, x.amount]));
    // diferença 4 jogos × 0,50 € = 2 € por cada jogador da dupla perdedora
    expect(by.a).toBeCloseTo(2);
    expect(by.c).toBeCloseTo(2);
    expect(by.b).toBeCloseTo(-2);
    expect(by.d).toBeCloseTo(-2);
    expect(st.reduce((t, x) => t + x.amount, 0)).toBeCloseTo(0);
  });
});
