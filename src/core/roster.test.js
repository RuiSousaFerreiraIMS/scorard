import { describe, it, expect } from 'vitest';
import { buildRoster } from './roster.js';

const sess = (names, when, extra = {}) => ({
  id: `s${when}`,
  gameId: 'fodinha',
  players: names.map((n, i) => ({ id: `p${i}`, name: n, ...(extra[n] || {}) })),
  setup: { baseValue: 1, increment: 1 },
  rounds: [],
  startedAt: when,
  finishedAt: when,
});

describe('buildRoster', () => {
  it('junta os jogadores do histórico, sem repetir', () => {
    const r = buildRoster(
      [sess(['Ana', 'Bea'], '2026-08-01T20:00:00Z'), sess(['Ana', 'Caz'], '2026-08-02T20:00:00Z')],
      [],
    );
    expect(r.map((p) => p.name).sort()).toEqual(['Ana', 'Bea', 'Caz']);
  });

  it('conta quantas vezes cada um jogou e ordena por isso', () => {
    const r = buildRoster(
      [sess(['Ana', 'Bea'], '2026-08-01T20:00:00Z'), sess(['Ana', 'Caz'], '2026-08-02T20:00:00Z')],
      [],
    );
    expect(r[0].name).toBe('Ana');
    expect(r[0].games).toBe(2);
  });

  it('trata nomes escritos de maneiras diferentes como a mesma pessoa', () => {
    const r = buildRoster(
      [sess(['Ana'], '2026-08-01T20:00:00Z'), sess([' ana '], '2026-08-02T20:00:00Z')],
      [],
    );
    expect(r).toHaveLength(1);
    expect(r[0].games).toBe(2);
    expect(r[0].name).toBe('Ana'); // a forma da primeira vez
  });

  it('inclui amigos mesmo que ainda não tenham jogado, com o id da conta', () => {
    const r = buildRoster([], [{ id: 'u1', display_name: 'Dux', email: 'd@x.pt' }]);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ name: 'Dux', userId: 'u1', games: 0 });
  });

  it('liga o amigo ao jogador do histórico com o mesmo nome', () => {
    const r = buildRoster(
      [sess(['Dux'], '2026-08-01T20:00:00Z')],
      [{ id: 'u1', display_name: 'dux', email: 'd@x.pt' }],
    );
    expect(r).toHaveLength(1);
    expect(r[0].userId).toBe('u1'); // tem conta → pode ajudar a marcar
    expect(r[0].games).toBe(1);
  });

  it('quem jogou mais recentemente vem à frente em caso de empate', () => {
    const r = buildRoster(
      [sess(['Bea'], '2026-08-01T20:00:00Z'), sess(['Caz'], '2026-08-05T20:00:00Z')],
      [],
    );
    expect(r[0].name).toBe('Caz');
  });

  it('sem histórico nem amigos devolve lista vazia', () => {
    expect(buildRoster([], [])).toEqual([]);
  });
});
