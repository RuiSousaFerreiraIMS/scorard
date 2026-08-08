// Lista de jogadores conhecidos, para escolher no setup em vez de escrever o
// nome de cada vez.
//
// Não precisa de tabela nova: a lista sai do que já existe — os jogadores que
// aparecem no histórico, mais os amigos. Quem tem conta fica com `userId`, e é
// isso que permite convidá-lo a ajudar a marcar numa sessão ao vivo (por id, não
// por o nome bater certo).

import { normalizeName } from './stats';

export function buildRoster(history, friends = []) {
  const byKey = new Map();

  const entry = (rawName) => {
    const key = normalizeName(rawName);
    if (!key) return null;
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        name: String(rawName).trim(),
        userId: null,
        games: 0,
        lastAt: null,
      });
    }
    return byKey.get(key);
  };

  for (const session of history) {
    const when = session.finishedAt || session.startedAt || null;
    for (const p of session.players || []) {
      const e = entry(p.name);
      if (!e) continue;
      e.games += 1;
      if (when && (!e.lastAt || new Date(when) > new Date(e.lastAt))) e.lastAt = when;
      if (p.userId) e.userId = p.userId; // jogou com conta
    }
  }

  // amigos entram sempre, mesmo que ainda não tenham jogado
  for (const f of friends) {
    const e = entry(f.display_name);
    if (e) e.userId = f.id;
  }

  return [...byKey.values()].sort(
    (a, b) =>
      b.games - a.games ||
      new Date(b.lastAt || 0) - new Date(a.lastAt || 0) ||
      a.name.localeCompare(b.name),
  );
}
