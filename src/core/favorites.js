// Jogos favoritos, guardados localmente. Na Fase 1 passam a sincronizar com a conta.

const KEY = 'scorard:favorites';

export function loadFavorites() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Substitui a lista toda (usado quando a conta traz os favoritos da cloud).
export function saveFavorites(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.isArray(list) ? list : []));
  } catch {
    /* ignora */
  }
}

export function isFavorite(id, favs = loadFavorites()) {
  return favs.includes(id);
}

export function toggleFavorite(id) {
  const favs = loadFavorites();
  const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignora */
  }
  return next;
}

// IDs de jogos jogados recentemente, do mais recente para o mais antigo, sem repetir.
export function recentGameIds(history, activeSession) {
  const ordered = [];
  if (activeSession) ordered.push(activeSession.gameId);
  for (const s of history) ordered.push(s.gameId);
  const seen = new Set();
  const out = [];
  for (const id of ordered) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}
