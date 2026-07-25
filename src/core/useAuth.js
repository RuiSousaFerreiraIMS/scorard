// Estado de autenticação (sessão Supabase). Funciona mesmo sem backend: nesse
// caso devolve user=null e hasSupabase=false, e a app segue em modo local.

import { useEffect, useState } from 'react';
import { supabase, hasSupabase } from './supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!hasSupabase);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, ready, hasSupabase };
}
