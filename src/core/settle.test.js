import { describe, it, expect } from 'vitest';
import { settleUp } from './settle.js';

// helper: soma dos valores transferidos por pessoa
function net(transfers) {
  const n = {};
  for (const t of transfers) {
    n[t.from] = (n[t.from] || 0) - t.amount;
    n[t.to] = (n[t.to] || 0) + t.amount;
  }
  return n;
}

describe('settleUp — quem paga a quem', () => {
  it('caso simples: um paga, um recebe', () => {
    const t = settleUp([
      { playerId: 'a', name: 'Ana', amount: 5 },
      { playerId: 'b', name: 'Bea', amount: -5 },
    ]);
    expect(t).toEqual([{ from: 'b', fromName: 'Bea', to: 'a', toName: 'Ana', amount: 5 }]);
  });

  it('dois devedores, um credor', () => {
    const t = settleUp([
      { playerId: 'a', name: 'Ana', amount: 5 },
      { playerId: 'b', name: 'Bea', amount: -2 },
      { playerId: 'c', name: 'Caz', amount: -3 },
    ]);
    expect(t).toHaveLength(2);
    expect(net(t).a).toBeCloseTo(5);
    expect(net(t).b).toBeCloseTo(-2);
    expect(net(t).c).toBeCloseTo(-3);
  });

  it('dois credores, um devedor', () => {
    const t = settleUp([
      { playerId: 'a', name: 'Ana', amount: 3.4 },
      { playerId: 'b', name: 'Bea', amount: 1.2 },
      { playerId: 'c', name: 'Caz', amount: -4.6 },
    ]);
    expect(t).toHaveLength(2);
    const n = net(t);
    expect(n.a).toBeCloseTo(3.4);
    expect(n.b).toBeCloseTo(1.2);
    expect(n.c).toBeCloseTo(-4.6);
    // quem paga é sempre o Caz
    expect(t.every((x) => x.from === 'c')).toBe(true);
  });

  it('ninguém deve nada → sem transferências', () => {
    expect(settleUp([
      { playerId: 'a', name: 'Ana', amount: 0 },
      { playerId: 'b', name: 'Bea', amount: 0 },
    ])).toEqual([]);
  });

  it('usa menos transferências do que pessoas', () => {
    const t = settleUp([
      { playerId: 'a', name: 'A', amount: 10 },
      { playerId: 'b', name: 'B', amount: -3 },
      { playerId: 'c', name: 'C', amount: -3 },
      { playerId: 'd', name: 'D', amount: -4 },
    ]);
    expect(t.length).toBeLessThanOrEqual(3); // n-1
    expect(net(t).a).toBeCloseTo(10);
  });

  it('trabalha em cêntimos: sem restos de vírgula flutuante', () => {
    const t = settleUp([
      { playerId: 'a', name: 'A', amount: 0.1 + 0.2 }, // 0.30000000000000004
      { playerId: 'b', name: 'B', amount: -0.3 },
    ]);
    expect(t[0].amount).toBe(0.3);
  });

  it('ignora cêntimos residuais (não inventa transferências de 0)', () => {
    const t = settleUp([
      { playerId: 'a', name: 'A', amount: 0.004 },
      { playerId: 'b', name: 'B', amount: -0.004 },
    ]);
    expect(t).toEqual([]);
  });
});
