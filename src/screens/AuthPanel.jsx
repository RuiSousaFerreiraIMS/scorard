// Formulário de conta: criar conta / entrar / sair. Usa Supabase Auth.
// Só trata de email + password; não guarda a password (vai direto ao Supabase).

import { useState } from 'react';
import { supabase } from '../core/supabase';

export default function AuthPanel({ user }) {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  if (user) {
    const name = user.email || 'a tua conta';
    return (
      <div className="card" style={{ borderColor: 'var(--goldDim)' }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Sessão iniciada</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, wordBreak: 'break-all' }}>
          {name}
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 0 }}
          onClick={() => supabase.auth.signOut()}
        >
          Terminar sessão
        </button>
      </div>
    );
  }

  const submit = async () => {
    if (!email || !password) {
      setErr('Preenche o email e a password.');
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) setMsg('Conta criada! Confirma o email para entrares.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setErr(traduzErro(e.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="eyebrow" style={{ marginBottom: 10 }}>
        {mode === 'signup' ? 'Criar conta' : 'Entrar'}
      </div>

      <input
        className="pinput"
        style={{ width: '100%', marginBottom: 10 }}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="email@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="pinput"
        style={{ width: '100%', marginBottom: 12 }}
        type="password"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {err && <div className="alert" style={{ marginBottom: 10 }}>{err}</div>}
      {msg && (
        <div className="curiosity" style={{ marginBottom: 10 }}>
          <p style={{ margin: 0 }}>{msg}</p>
        </div>
      )}

      <button type="button" className="btn btn-primary" style={{ marginTop: 0 }} disabled={busy} onClick={submit}>
        {busy ? 'A processar…' : mode === 'signup' ? 'Criar conta' : 'Entrar'}
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => {
          setMode(mode === 'signup' ? 'login' : 'signup');
          setErr(null);
          setMsg(null);
        }}
      >
        {mode === 'signup' ? 'Já tenho conta — entrar' : 'Não tenho conta — criar'}
      </button>
    </div>
  );
}

function traduzErro(m = '') {
  if (/invalid login credentials/i.test(m)) return 'Email ou password errados.';
  if (/already registered/i.test(m)) return 'Este email já tem conta. Tenta entrar.';
  if (/password should be at least/i.test(m)) return 'A password é demasiado curta (mín. 6).';
  if (/email.*invalid|invalid.*email/i.test(m)) return 'Esse email não parece válido.';
  return m || 'Algo correu mal. Tenta outra vez.';
}
