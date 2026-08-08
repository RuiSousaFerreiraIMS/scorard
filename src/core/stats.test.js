import { describe, it, expect } from 'vitest';
import { computeStats } from './stats.js';

// Duas sessões de Fodinha (1€/ronda, 4 jogadores).
// S1: ronda com 'b' a perder  -> b −1 ; a,c,d +0.333 cada
// S2: ronda com 'c' e 'd' a perder -> c,d −1 ; a,b +1 cada
const mkSession = (id, rounds, when) => ({
  id,
  gameId: 'fodinha',
  players: [
    { id: 'a', name: 'Ana' },
    { id: 'b', name: 'Bea' },
    { id: 'c', name: 'Caz' },
    { id: 'd', name: 'Dux' },
  ],
  setup: { baseValue: 1, increment: 1 },
  rounds,
  startedAt: when,
  finishedAt: when,
});

const history = [
  mkSession('s1', [{ loserIds: ['b'] }], '2026-08-01T20:00:00.000Z'),
  mkSession('s2', [{ loserIds: ['c', 'd'] }], '2026-08-02T20:00:00.000Z'),
];

describe('computeStats', () => {
  it('conta jogos totais e por jogo', () => {
    const s = computeStats(history);
    expect(s.totalGames).toBe(2);
    expect(s.byGame).toEqual([{ gameId: 'fodinha', name: 'Fodinha', count: 2 }]);
  });

  it('acumula dinheiro por jogador ao longo das sessões', () => {
    const s = computeStats(history);
    const by = Object.fromEntries(s.players.map((p) => [p.name, p]));
    // Ana: +1/3 (s1) + 1 (s2)
    expect(by.Ana.money).toBeCloseTo(1 / 3 + 1, 2);
    // Bea: −1 (s1) + 1 (s2) = 0
    expect(by.Bea.money).toBeCloseTo(0, 2);
    // Caz: +1/3 (s1) − 1 (s2)
    expect(by.Caz.money).toBeCloseTo(1 / 3 - 1, 2);
  });

  it('conta jogos jogados e vitórias por jogador', () => {
    const s = computeStats(history);
    const by = Object.fromEntries(s.players.map((p) => [p.name, p]));
    expect(by.Ana.games).toBe(2);
    expect(by.Ana.wins).toBe(2); // ficou em 1º nas duas
    expect(by.Caz.wins).toBe(0);
  });

  it('ordena os jogadores por dinheiro, do melhor para o pior', () => {
    const s = computeStats(history);
    const money = s.players.map((p) => p.money);
    expect(money).toEqual([...money].sort((x, y) => y - x));
    expect(s.players[0].name).toBe('Ana');
  });

  it('junta o mesmo jogador escrito de maneiras diferentes', () => {
    // a mesma pessoa: "Ana", " ana " e "ANA"
    const variantes = [
      mkSession('v1', [{ loserIds: ['b'] }], '2026-08-01T20:00:00.000Z'),
      {
        ...mkSession('v2', [{ loserIds: ['b'] }], '2026-08-02T20:00:00.000Z'),
        players: [
          { id: 'a', name: ' ana ' },
          { id: 'b', name: 'Bea' },
          { id: 'c', name: 'Caz' },
          { id: 'd', name: 'Dux' },
        ],
      },
    ];
    const s = computeStats(variantes);
    const anas = s.players.filter((p) => p.name.toLowerCase().trim() === 'ana');
    expect(anas).toHaveLength(1);
    expect(anas[0].games).toBe(2);
    expect(anas[0].name).toBe('Ana'); // mostra como foi escrito da 1ª vez
  });

  it('histórico vazio devolve estatísticas vazias, sem rebentar', () => {
    const s = computeStats([]);
    expect(s.totalGames).toBe(0);
    expect(s.players).toEqual([]);
    expect(s.byGame).toEqual([]);
  });

  it('ignora sessões de jogos desconhecidos', () => {
    const s = computeStats([...history, { ...mkSession('x', [], '2026-08-03'), gameId: 'nao-existe' }]);
    expect(s.totalGames).toBe(2);
  });
});
