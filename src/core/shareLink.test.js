import { describe, it, expect } from 'vitest';
import { encodeSession, decodeSession } from './shareLink.js';

describe('shareLink — codificação de sessão', () => {
  const session = {
    id: 'x',
    gameId: 'sobeedesce',
    players: [
      { id: 'a', name: 'João' }, // acento → testa UTF-8
      { id: 'b', name: 'Bea' },
    ],
    setup: { valuePerPoint: 0.2 },
    rounds: [
      {
        chooserId: 'a',
        mode: 'escolheu',
        suit: 'espadas',
        dark: false,
        went: { a: true, b: true },
        tricks: { a: 3, b: 2 },
      },
    ],
    startedAt: 1721000000000,
    finishedAt: null,
  };

  it('round-trip preserva os campos partilháveis', () => {
    const code = encodeSession(session);
    const back = decodeSession(code);
    expect(back.gameId).toBe('sobeedesce');
    expect(back.players).toEqual(session.players);
    expect(back.setup).toEqual(session.setup);
    expect(back.rounds).toEqual(session.rounds);
    expect(back.startedAt).toBe(session.startedAt);
    expect(back.finishedAt).toBeNull();
  });

  it('preserva nomes com acentos', () => {
    const back = decodeSession(encodeSession(session));
    expect(back.players[0].name).toBe('João');
  });

  it('código base64url não tem caracteres inseguros para URL', () => {
    const code = encodeSession(session);
    expect(code).not.toMatch(/[+/=]/);
  });

  it('devolve null para lixo', () => {
    expect(decodeSession('não-é-base64-válido###')).toBeNull();
    expect(decodeSession('')).toBeNull();
  });
});
