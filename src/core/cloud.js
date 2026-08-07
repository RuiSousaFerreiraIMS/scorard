// Sincronização com a conta (Supabase). Regras de ouro:
//
// 1. NUNCA rebentar: se a rede falhar, tudo devolve null/[] e a app continua a
//    funcionar em modo local. O telemóvel é sempre a cópia que não falha.
// 2. NUNCA perder jogos: ao entrar na conta, junta-se o que está no telemóvel
//    com o que está na cloud (união), e o que falta é enviado.
//
// A tabela `sessions` gera o seu próprio id (uuid) e os ids locais são curtos,
// por isso a correspondência entre os dois lados faz-se por (jogo + data de
// início), que é único na prática.

import { supabase } from './supabase';

const keyOf = (s) => `${s.gameId}|${toIso(s.startedAt)}`;

function toIso(v) {
  if (!v) return null;
  if (typeof v === 'number') return new Date(v).toISOString();
  return String(v);
}

function rowToSession(row) {
  return {
    id: row.id,
    gameId: row.game_id,
    players: row.players,
    setup: row.setup,
    rounds: row.rounds,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  };
}

function sessionToRow(session, userId) {
  return {
    user_id: userId,
    game_id: session.gameId,
    players: session.players,
    setup: session.setup,
    rounds: session.rounds,
    started_at: toIso(session.startedAt),
    finished_at: toIso(session.finishedAt),
  };
}

// ---------- favoritos ----------

export async function fetchFavorites(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('favorites')
    .select('game_id')
    .eq('user_id', userId);
  if (error) return null;
  return data.map((r) => r.game_id);
}

export async function pushFavorite(userId, gameId) {
  if (!supabase) return;
  await supabase.from('favorites').upsert({ user_id: userId, game_id: gameId });
}

export async function dropFavorite(userId, gameId) {
  if (!supabase) return;
  await supabase.from('favorites').delete().eq('user_id', userId).eq('game_id', gameId);
}

// ---------- jogos terminados ----------

export async function fetchSessions(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('finished_at', { ascending: false, nullsFirst: false });
  if (error) return null;
  return data.map(rowToSession);
}

export async function pushSession(userId, session) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionToRow(session, userId))
    .select()
    .single();
  if (error) return null;
  return rowToSession(data);
}

export async function dropSession(userId, sessionId) {
  if (!supabase) return;
  // só apaga se for um id da cloud (uuid); ids locais não existem lá
  await supabase.from('sessions').delete().eq('user_id', userId).eq('id', sessionId);
}

// ---------- juntar os dois lados ao entrar na conta ----------

export async function syncOnLogin(userId, localFavorites, localHistory) {
  const cloudFavs = await fetchFavorites(userId);
  const cloudSessions = await fetchSessions(userId);

  // Sem resposta da cloud (offline / erro) → fica tudo como está no telemóvel.
  if (cloudFavs === null || cloudSessions === null) {
    return { favorites: localFavorites, history: localHistory, ok: false };
  }

  // Favoritos: união. O que só existe no telemóvel sobe.
  const favorites = [...new Set([...cloudFavs, ...localFavorites])];
  await Promise.all(
    localFavorites.filter((g) => !cloudFavs.includes(g)).map((g) => pushFavorite(userId, g)),
  );

  // Jogos: os que só existem no telemóvel sobem e passam a ter id da cloud.
  const cloudKeys = new Set(cloudSessions.map(keyOf));
  const missing = localHistory.filter((s) => !cloudKeys.has(keyOf(s)));
  const uploaded = [];
  for (const s of missing) {
    const saved = await pushSession(userId, s);
    uploaded.push(saved || s); // se falhar a subir, mantém-se a versão local
  }

  const history = [...cloudSessions, ...uploaded].sort(
    (a, b) => new Date(b.finishedAt || b.startedAt) - new Date(a.finishedAt || a.startedAt),
  );

  return { favorites, history, ok: true };
}
