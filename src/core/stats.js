// Estatísticas de sempre, calculadas a partir do histórico de jogos guardados.
//
// Os jogadores são identificados pelo NOME (é assim que a app os regista à mesa).
// Para um grupo de amigos isto chega e não obriga ninguém a ter conta para
// aparecer no ranking.
//
// O dinheiro vem do getSettlement de cada jogo (é o mesmo número que aparece no
// acerto de contas), por isso um jogo novo entra aqui sem se tocar neste ficheiro.

import { getGame } from './gameRegistry';
import { deriveState } from './session';

// "Rui", " rui " e "RUI" são a mesma pessoa. Sem isto, o mesmo jogador aparecia
// várias vezes no ranking só por causa de maiúsculas ou espaços a mais.
export function normalizeName(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt');
}

export function computeStats(history) {
  const byGameCount = new Map();
  const players = new Map(); // chave normalizada -> { name, games, wins, money }

  // Guarda a forma como o nome foi escrito da primeira vez (é a que se mostra).
  const bump = (rawName) => {
    const key = normalizeName(rawName);
    if (!players.has(key)) {
      players.set(key, { name: String(rawName).trim(), games: 0, wins: 0, money: 0 });
    }
    return players.get(key);
  };

  let totalGames = 0;

  for (const session of history) {
    const game = getGame(session.gameId);
    if (!game) continue; // jogo de uma versão que já não existe

    totalGames++;
    byGameCount.set(session.gameId, (byGameCount.get(session.gameId) || 0) + 1);

    let state;
    try {
      state = deriveState(session, game);
    } catch {
      continue; // sessão corrompida: conta como jogo, mas não estraga o resto
    }

    // participações
    for (const p of session.players) bump(p.name).games++;

    // vencedor = primeiro da classificação
    const standings = game.getStandings(state);
    if (standings.length > 0) bump(standings[0].name).wins++;

    // dinheiro (só para jogos que fazem contas em euros)
    if (typeof game.getSettlement === 'function') {
      for (const e of game.getSettlement(state)) bump(e.name).money += e.amount;
    }
  }

  const byGame = [...byGameCount.entries()]
    .map(([gameId, count]) => ({ gameId, name: getGame(gameId)?.name || gameId, count }))
    .sort((a, b) => b.count - a.count);

  const playerList = [...players.values()].sort(
    (a, b) => b.money - a.money || b.wins - a.wins || a.name.localeCompare(b.name),
  );

  return { totalGames, byGame, players: playerList };
}
