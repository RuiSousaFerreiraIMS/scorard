// Separador Amigos: pedidos recebidos, lista de amigos e procura por email.
// Só existe com sessão iniciada — sem conta não há amigos para mostrar.

import { useEffect, useState } from 'react';
import {
  loadFriends,
  searchProfiles,
  sendRequest,
  acceptRequest,
  removeFriend,
} from '../core/friends';
import { Eyebrow } from '../ui/components.jsx';
import { Icon } from '../ui/icons.jsx';

export default function FriendsScreen({ user }) {
  const [data, setData] = useState(null);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);

  const refresh = async () => setData(await loadFriends(user.id));

  useEffect(() => {
    refresh();
  }, [user.id]);

  // procura com atraso, para não disparar a cada tecla
  useEffect(() => {
    if (term.trim().length < 3) {
      setResults([]);
      return undefined;
    }
    const t = setTimeout(async () => {
      setResults(await searchProfiles(term, user.id));
    }, 350);
    return () => clearTimeout(t);
  }, [term, user.id]);

  const act = async (fn, msg) => {
    setBusy(true);
    const ok = await fn();
    setBusy(false);
    setNote(ok ? msg : 'Não deu. Tenta outra vez.');
    setTerm('');
    setResults([]);
    await refresh();
    setTimeout(() => setNote(null), 2500);
  };

  const known = new Set([
    ...(data?.friends || []).map((f) => f.id),
    ...(data?.incoming || []).map((f) => f.id),
    ...(data?.outgoing || []).map((f) => f.id),
  ]);

  return (
    <>
      <Eyebrow>A tua malta</Eyebrow>
      <h1>Amigos</h1>
      <p className="sub">Adiciona quem joga contigo e mete-os num jogo num toque.</p>

      {note && <div className="curiosity" style={{ marginBottom: 12 }}><p style={{ margin: 0 }}>{note}</p></div>}

      <input
        className="pinput"
        style={{ width: '100%', marginBottom: 12 }}
        type="email"
        inputMode="email"
        placeholder="Procurar por email…"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />

      {results.map((p) => (
        <div key={p.id} className="friendrow">
          <Avatar name={p.display_name} />
          <span className="friendname">
            {p.display_name}
            <span className="friendmeta">{p.email}</span>
          </span>
          {known.has(p.id) ? (
            <span className="friendtag">já na lista</span>
          ) : (
            <button
              type="button"
              className="friendbtn"
              disabled={busy}
              onClick={() => act(() => sendRequest(user.id, p.id), 'Pedido enviado.')}
            >
              <Icon name="plus" size={16} /> Pedir
            </button>
          )}
        </div>
      ))}

      {data?.incoming?.length > 0 && (
        <>
          <Eyebrow style={{ marginTop: 20, marginBottom: 10 }}>Pedidos recebidos</Eyebrow>
          {data.incoming.map((p) => (
            <div key={p.id} className="friendrow">
              <Avatar name={p.display_name} />
              <span className="friendname">
                {p.display_name}
                <span className="friendmeta">{p.email}</span>
              </span>
              <button
                type="button"
                className="friendbtn"
                disabled={busy}
                onClick={() => act(() => acceptRequest(user.id, p.id), 'Amizade aceite!')}
              >
                Aceitar
              </button>
              <button
                type="button"
                className="friendbtn ghost"
                disabled={busy}
                onClick={() => act(() => removeFriend(user.id, p.id), 'Pedido recusado.')}
                aria-label="Recusar"
              >
                ×
              </button>
            </div>
          ))}
        </>
      )}

      <Eyebrow style={{ marginTop: 20, marginBottom: 10 }}>
        Amigos {data?.friends?.length ? `(${data.friends.length})` : ''}
      </Eyebrow>

      {!data && <div className="settle-none">A carregar…</div>}

      {data?.friends?.length === 0 && (
        <div className="settle-none">
          Ainda sem amigos. Procura pelo email de quem joga contigo — depois de aceitarem,
          aparecem aqui e podes metê-los num jogo num toque.
        </div>
      )}

      {data?.friends?.map((p) => (
        <div key={p.id} className="friendrow">
          <Avatar name={p.display_name} />
          <span className="friendname">
            {p.display_name}
            <span className="friendmeta">{p.email}</span>
          </span>
          <button
            type="button"
            className="friendbtn ghost"
            disabled={busy}
            onClick={() => {
              if (window.confirm(`Remover ${p.display_name} dos amigos?`)) {
                act(() => removeFriend(user.id, p.id), 'Removido.');
              }
            }}
            aria-label="Remover"
          >
            ×
          </button>
        </div>
      ))}

      {data?.outgoing?.length > 0 && (
        <>
          <Eyebrow style={{ marginTop: 20, marginBottom: 10 }}>Pedidos enviados</Eyebrow>
          {data.outgoing.map((p) => (
            <div key={p.id} className="friendrow">
              <Avatar name={p.display_name} />
              <span className="friendname">
                {p.display_name}
                <span className="friendmeta">à espera de resposta</span>
              </span>
              <button
                type="button"
                className="friendbtn ghost"
                disabled={busy}
                onClick={() => act(() => removeFriend(user.id, p.id), 'Pedido cancelado.')}
                aria-label="Cancelar"
              >
                ×
              </button>
            </div>
          ))}
        </>
      )}
    </>
  );
}

export function Avatar({ name = '' }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return <span className="avatar friendavatar">{initials || '?'}</span>;
}
