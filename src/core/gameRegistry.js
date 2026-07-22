// src/core/gameRegistry.js
//
// O registry e o unico sitio onde se "liga" um jogo novo a app.
// Para adicionar a sueca/hearts depois: cria src/games/<jogo>.js a cumprir
// a mesma interface e adiciona aqui ao array. Mais nada muda no resto da app.
//
// CONTRATO QUE CADA JOGO TEM DE CUMPRIR (ver fodinha.js como referencia):
//   id, name, description, minPlayers, maxPlayers, setupFields,
//   createState(players, setup), getRoundConfig(state), applyRound(state, input),
//   isFinished(state), getStandings(state), inputComponentKey

import fodinha from '../games/fodinha';

const GAMES = [fodinha];

export function listGames() {
  return GAMES.map((g) => ({
    id: g.id, name: g.name, description: g.description,
    minPlayers: g.minPlayers, maxPlayers: g.maxPlayers,
  }));
}

export function getGame(id) {
  return GAMES.find((g) => g.id === id) || null;
}
