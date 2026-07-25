// Cliente Supabase. A "publishable key" é pública por design (vive no frontend);
// a segurança faz-se por Row Level Security nas tabelas. NUNCA meter aqui a chave
// secreta (sb_secret_...).
//
// Se um dia quiseres trocar de projeto, muda só estas duas linhas (ou passa a ler
// de variáveis de ambiente Vite: import.meta.env.VITE_SUPABASE_URL, etc.).

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mcrrxbczdungkotbunob.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_UphdK0nHv4fyBmii9onEEQ_SwgyM-i6';

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
