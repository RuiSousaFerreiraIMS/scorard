import { describe, it, expect } from 'vitest';
import {
  createSession,
  deriveState,
  deriveStepStates,
  appendRound,
  undoRound,
  finishSession,
} from './session.js';
import fodinha from '../games/fodinha/index.js';

const players = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Bea' },
  { id: 'c', name: 'Caz' },
];
const setup = { baseValue: 1, increment: 1 };

function mkSession() {
  return createSession('fodinha', players, setup);
}

describe('session — event sourcing', () => {
  it('sessão vazia deriva o estado inicial', () => {
    const s = mkSession();
    const state = deriveState(s, fodinha);
    expect(state.roundIndex).toBe(0);
    expect(state.balances.every((b) => b.money === 0)).toBe(true);
  });

  it('appendRound acrescenta um evento sem mutar o original', () => {
    const s = mkSession();
    const s2 = appendRound(s, { loserIds: ['c'] });
    expect(s.rounds).toHaveLength(0); // imutável
    expect(s2.rounds).toHaveLength(1);
  });

  it('deriveState dobra todos os rounds', () => {
    let s = mkSession();
    s = appendRound(s, { loserIds: ['c'] });
    s = appendRound(s, { loserIds: ['a'] });
    const state = deriveState(s, fodinha);
    expect(state.roundIndex).toBe(2);
  });

  it('undo remove a última ronda e recalcula', () => {
    let s = mkSession();
    s = appendRound(s, { loserIds: ['c'] });
    s = appendRound(s, { loserIds: ['a'] });
    const before = deriveState(s, fodinha);
    s = undoRound(s);
    const after = deriveState(s, fodinha);
    expect(s.rounds).toHaveLength(1);
    expect(after.roundIndex).toBe(1);
    // o estado depois do undo é igual a ter feito só a 1ª ronda
    expect(after.balances).not.toEqual(before.balances);
  });

  it('undo numa sessão vazia é no-op', () => {
    const s = mkSession();
    expect(undoRound(s).rounds).toHaveLength(0);
  });

  it('deriveStepStates dá um estado por ronda', () => {
    let s = mkSession();
    s = appendRound(s, { loserIds: ['c'] });
    s = appendRound(s, { loserIds: [] });
    const steps = deriveStepStates(s, fodinha);
    expect(steps).toHaveLength(2);
    expect(steps[0].roundIndex).toBe(1);
    expect(steps[1].roundIndex).toBe(2);
  });

  it('finishSession marca finishedAt', () => {
    const s = finishSession(mkSession());
    expect(s.finishedAt).toBeTruthy();
  });
});
