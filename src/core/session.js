// src/core/session.js
//
// A sessão é um REGISTO DE EVENTOS: guarda os inputs de cada ronda, não o estado.
// O estado visível é sempre derivado (dobrando os rounds pelo applyRound do jogo).
// Isto dá-nos, de graça: desfazer, histórico ronda-a-ronda, e (futuro) partilha.

import { getGame } from './gameRegistry';

export function newId() {
  // id curto o suficiente para não colidir na prática, sem dependências.
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function createSession(gameId, players, setup) {
  return {
    id: newId(),
    gameId,
    players: players.map((p) => ({ id: p.id, name: p.name })),
    setup,
    rounds: [],
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };
}

// Estado inicial do jogo para esta sessão.
function initialState(session, game) {
  return game.createState(session.players, session.setup);
}

// Dobra todos os rounds e devolve o estado atual.
export function deriveState(session, game = getGame(session.gameId)) {
  return session.rounds.reduce(
    (s, input) => game.applyRound(s, input),
    initialState(session, game),
  );
}

// Estados intermédios: [estado após ronda 1, após ronda 2, ...].
// Usado no histórico ronda-a-ronda (comum a todos os jogos).
export function deriveStepStates(session, game = getGame(session.gameId)) {
  const steps = [];
  let s = initialState(session, game);
  for (const input of session.rounds) {
    s = game.applyRound(s, input);
    steps.push(s);
  }
  return steps;
}

// Acrescenta uma ronda (imutável).
export function appendRound(session, input) {
  return { ...session, rounds: [...session.rounds, input] };
}

// Desfaz a última ronda.
export function undoRound(session) {
  if (session.rounds.length === 0) return session;
  return { ...session, rounds: session.rounds.slice(0, -1) };
}

export function finishSession(session) {
  return { ...session, finishedAt: new Date().toISOString() };
}
