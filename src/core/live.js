// Sessão ao vivo: a mesma lista de rondas da app, mas partilhada.
//
// Como a sessão já é um registo de eventos (rounds), pôr um jogo ao vivo é só
// sincronizar essa lista: quem marca envia a ronda, quem está a ver recebe-a e
// deriva o estado com o mesmo motor. Não há lógica de jogo duplicada aqui.
//
// Permissões (garantidas pela base de dados, não por esta camada):
//  - qualquer pessoa com o link VÊ a sessão;
//  - só o dono e os jogadores convidados ESCREVEM o resultado;
//  - comentar exige conta.

import { supabase } from './supabase';

export function liveUrl(id) {
  return `${location.origin}${location.pathname}#live=${id}`;
}

export function readLiveHash() {
  const m = (location.hash || '').match(/[#&]live=([0-9a-f-]{36})/i);
  return m ? m[1] : null;
}

function rowToSession(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    gameId: row.game_id,
    players: row.players,
    setup: row.setup,
    rounds: row.rounds || [],
    finished: row.finished,
    startedAt: row.created_at,
  };
}

// Publica uma sessão local como sessão ao vivo. Devolve a sessão ao vivo ou null.
export async function createLive(user, session) {
  if (!supabase || !user) return null;
  const { data, error } = await supabase
    .from('live_sessions')
    .insert({
      owner_id: user.id,
      game_id: session.gameId,
      players: session.players,
      setup: session.setup,
      rounds: session.rounds || [],
    })
    .select()
    .single();
  if (error) return null;
  return rowToSession(data);
}

export async function fetchLive(id) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('live_sessions').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToSession(data);
}

// Envia o estado das rondas. Quem não tiver permissão recebe erro e nada muda.
export async function pushRounds(id, rounds, finished = false) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('live_sessions')
    .update({ rounds, finished, updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

// Convidar um amigo a poder editar o resultado.
export async function invitePlayer(sessionId, userId) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('live_players')
    .insert({ session_id: sessionId, user_id: userId });
  return !error;
}

export async function fetchPlayers(sessionId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('live_players')
    .select('user_id')
    .eq('session_id', sessionId);
  if (error) return [];
  return data.map((r) => r.user_id);
}

// --- comentários ---

export async function fetchComments(sessionId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('live_comments')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) return [];
  return data;
}

export async function postComment(sessionId, user, name, body) {
  if (!supabase || !user) return false;
  const { error } = await supabase.from('live_comments').insert({
    session_id: sessionId,
    user_id: user.id,
    author_name: name,
    body: body.slice(0, 500),
  });
  return !error;
}

// --- tempo real ---
// Devolve uma função para desligar. onSession recebe a sessão atualizada;
// onComment recebe cada comentário novo.
export function subscribeLive(id, { onSession, onComment }) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`live:${id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'live_sessions', filter: `id=eq.${id}` },
      (payload) => onSession && onSession(rowToSession(payload.new)),
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'live_comments', filter: `session_id=eq.${id}` },
      (payload) => onComment && onComment(payload.new),
    )
    .subscribe((status, err) => {
      // Só interessa saber quando a ligação ao vivo se perde; o Supabase tenta
      // religar sozinho, e a vista continua a mostrar o último estado conhecido.
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        // eslint-disable-next-line no-console
        console.warn('[live] ligação ao vivo com problemas:', status, err || '');
      }
    });

  return () => supabase.removeChannel(channel);
}
