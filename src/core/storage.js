// src/core/storage.js
//
// Persistência local (localStorage). Síncrono e simples.
// - cardscore:active   -> a sessão ativa (ou ausente)
// - cardscore:history  -> array de sessões terminadas, mais recente primeiro
//
// Todos os acessos são defensivos: quota cheia ou modo privado nunca rebentam a
// app; o pior caso é não persistir.

const ACTIVE_KEY = 'cardscore:active';
const HISTORY_KEY = 'cardscore:history';

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignora: quota / modo privado */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignora */
  }
}

// --- Sessão ativa ---
export function saveActive(session) {
  write(ACTIVE_KEY, session);
}
export function loadActive() {
  return read(ACTIVE_KEY);
}
export function clearActive() {
  remove(ACTIVE_KEY);
}

// --- Histórico (comum a todos os jogos) ---
export function loadHistory() {
  const h = read(HISTORY_KEY);
  return Array.isArray(h) ? h : [];
}

export function addToHistory(session) {
  const history = loadHistory();
  // dedupe por id (evita duplicados se terminar duas vezes)
  const filtered = history.filter((s) => s.id !== session.id);
  write(HISTORY_KEY, [session, ...filtered]);
}

export function removeFromHistory(id) {
  write(HISTORY_KEY, loadHistory().filter((s) => s.id !== id));
}

export function clearHistory() {
  remove(HISTORY_KEY);
}
