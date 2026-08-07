// Amigos: procurar por email, pedir, aceitar e remover.
//
// A tabela `friendships` guarda uma linha por pedido (de user_id para friend_id).
// Uma amizade está feita quando o estado é 'accepted'. Como a linha pode estar
// em qualquer sentido, aqui normaliza-se sempre para "o outro" — quem usa a app
// só quer saber de pessoas, não de quem pediu primeiro.
//
// Como o resto da cloud: nunca rebenta. Em erro devolve null/[] e a app segue.

import { supabase } from './supabase';

// Garante que a conta tem perfil (nome + email para ser encontrável).
// Contas criadas antes de o trigger existir não têm linha em `profiles`; sem isto
// apareciam como "Alguém" e não podiam ser procuradas. Corre em cada login e
// cura-se sozinho, sem ser preciso mexer na base de dados.
export async function ensureProfile(user) {
  if (!supabase || !user) return;
  const fallbackName = (user.email || '').split('@')[0] || 'Jogador';

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('id', user.id)
    .maybeSingle();
  if (error) return;

  if (!data) {
    await supabase
      .from('profiles')
      .insert({ id: user.id, display_name: fallbackName, email: user.email });
    return;
  }

  // perfil antigo sem email (ou sem nome) → completar, sem apagar o que já lá está
  const patch = {};
  if (!data.email && user.email) patch.email = user.email;
  if (!data.display_name) patch.display_name = fallbackName;
  if (Object.keys(patch).length > 0) {
    await supabase.from('profiles').update(patch).eq('id', user.id);
  }
}

// Procura contas por email (exato ou início), tirando a própria.
export async function searchProfiles(term, selfId) {
  if (!supabase || !term || term.trim().length < 3) return [];
  const t = term.trim().toLowerCase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .ilike('email', `${t}%`)
    .neq('id', selfId)
    .limit(10);
  if (error) return [];
  return data;
}

// Devolve { friends: [...], incoming: [...], outgoing: [...] } já com perfis.
export async function loadFriends(selfId) {
  if (!supabase) return null;

  const { data: rows, error } = await supabase
    .from('friendships')
    .select('user_id, friend_id, status')
    .or(`user_id.eq.${selfId},friend_id.eq.${selfId}`);
  if (error) return null;

  const otherIds = rows.map((r) => (r.user_id === selfId ? r.friend_id : r.user_id));
  const profiles = await profilesByIds(otherIds);

  const friends = [];
  const incoming = []; // pedidos que me fizeram, à espera de resposta
  const outgoing = []; // pedidos que fiz

  for (const r of rows) {
    const otherId = r.user_id === selfId ? r.friend_id : r.user_id;
    const p = profiles[otherId] || { id: otherId, display_name: 'Alguém', email: '' };
    const entry = { ...p, requestedByMe: r.user_id === selfId };
    if (r.status === 'accepted') friends.push(entry);
    else if (entry.requestedByMe) outgoing.push(entry);
    else incoming.push(entry);
  }

  const byName = (a, b) => (a.display_name || '').localeCompare(b.display_name || '');
  return { friends: friends.sort(byName), incoming, outgoing };
}

async function profilesByIds(ids) {
  if (!supabase || ids.length === 0) return {};
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .in('id', ids);
  if (error) return {};
  return Object.fromEntries(data.map((p) => [p.id, p]));
}

export async function sendRequest(selfId, otherId) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: selfId, friend_id: otherId, status: 'pending' });
  return !error;
}

// Aceitar: a linha existe no sentido contrário (o outro pediu-me).
export async function acceptRequest(selfId, otherId) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('user_id', otherId)
    .eq('friend_id', selfId);
  return !error;
}

// Remover funciona nos dois sentidos (recusar um pedido ou desfazer amizade).
export async function removeFriend(selfId, otherId) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(
      `and(user_id.eq.${selfId},friend_id.eq.${otherId}),` +
        `and(user_id.eq.${otherId},friend_id.eq.${selfId})`,
    );
  return !error;
}
