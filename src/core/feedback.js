// Sugestões e feedback dos utilizadores ("o meu jogo não está aqui").
//
// Tenta guardar na base de dados; se a tabela ainda não existir (ou não houver
// rede), devolve 'offline' e a interface oferece mandar por email. Assim a
// funcionalidade nunca fica partida à espera de configuração.

import { supabase } from './supabase';

export const CONTACT_EMAIL = 'rui.edh.ferreira@gmail.com';

export async function sendFeedback({ kind, body, gameName, user }) {
  const texto = String(body || '').trim();
  if (!texto) return 'vazio';
  if (!supabase) return 'offline';

  const { error } = await supabase.from('feedback').insert({
    user_id: user?.id || null,
    author_name: user ? (user.email || '').split('@')[0] : null,
    kind, // 'jogo' | 'ideia' | 'problema'
    game_name: gameName || null,
    body: texto.slice(0, 2000),
  });

  return error ? 'offline' : 'ok';
}

// Alternativa quando não dá para guardar: abrir o email já escrito.
export function mailtoLink({ kind, body, gameName }) {
  const assunto =
    kind === 'jogo' ? `Scorard — sugestão de jogo${gameName ? `: ${gameName}` : ''}` : 'Scorard — feedback';
  const corpo = gameName ? `Jogo: ${gameName}\n\n${body}` : body;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}
