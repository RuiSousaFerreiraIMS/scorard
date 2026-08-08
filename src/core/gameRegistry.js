// src/core/gameRegistry.js
//
// O registry é o único sítio onde se "liga" um jogo novo à app.
// Para adicionar o Sobe e Desce / Sueca / Hearts: cria uma pasta em src/games/<jogo>/
// com um index.js a cumprir o contrato abaixo e acrescenta-o a este array.
// Mais nada muda no resto da app — os ecrãs são moldura genérica.
//
// CONTRATO QUE CADA JOGO TEM DE CUMPRIR (ver games/fodinha/index.js como referência):
//   id, name, description, minPlayers, maxPlayers,
//   setupFields, createState(players, setup), applyRound(state, input),
//   getRoundConfig(state), getStandings(state), isFinished(state),
//   roundSummary(input, index, players), RoundInput (componente React)

import fodinha from '../games/fodinha/index.js';
import sobeedesce from '../games/sobeedesce/index.js';
import sueca from '../games/sueca/index.js';
import hearts from '../games/hearts/index.js';
import king from '../games/king/index.js';

const GAMES = [fodinha, sobeedesce, sueca, hearts, king];

export function listGames() {
  return GAMES.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    minPlayers: g.minPlayers,
    maxPlayers: g.maxPlayers,
    suit: g.suit,
    difficulty: g.difficulty,
  }));
}

export function getGame(id) {
  return GAMES.find((g) => g.id === id) || null;
}
