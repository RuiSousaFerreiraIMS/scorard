// Quem pode marcar a pontuação numa sessão ao vivo.
//
// Serve dois casos: os amigos que estão a jogar (convidados automaticamente ao
// pôr ao vivo) e alguém de fora do jogo que faça de marcador — útil quando quem
// marca não está a jogar.

import { useEffect, useState } from 'react';
import { loadFriends } from '../core/friends';
import { fetchPlayers, invitePlayer, removePlayer } from '../core/live';
import { Eyebrow } from './components.jsx';
import { Icon } from './icons.jsx';
import { Avatar } from '../screens/FriendsScreen.jsx';

export default function LiveInvitePanel({ sessionId, user, onClose }) {
  const [friends, setFriends] = useState([]);
  const [invited, setInvited] = useState([]);
  const [busy, setBusy] = useState(null);

  const refresh = async () => setInvited(await fetchPlayers(sessionId));

  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await loadFriends(user.id);
      if (alive && d) setFriends(d.friends);
      if (alive) await refresh();
    })();
    return () => {
      alive = false;
    };
  }, [sessionId, user.id]);

  const toggle = async (friendId, isInvited) => {
    setBusy(friendId);
    if (isInvited) await removePlayer(sessionId, friendId);
    else await invitePlayer(sessionId, friendId);
    await refresh();
    setBusy(null);
  };

  return (
    <div className="invitepanel">
      <div className="invitehead">
        <Eyebrow>Quem pode marcar</Eyebrow>
        <button type="button" className="premove" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>

      <div className="hint" style={{ marginBottom: 12 }}>
        Tu marcas sempre. Podes deixar amigos ajudar — mesmo que não estejam a jogar.
      </div>

      {friends.length === 0 && (
        <div className="settle-none">
          Ainda não tens amigos na Scorard. Adiciona-os no separador Amigos e podem
          ajudar a marcar.
        </div>
      )}

      {friends.map((f) => {
        const isInvited = invited.includes(f.id);
        return (
          <div key={f.id} className="friendrow">
            <Avatar name={f.display_name} />
            <span className="friendname">
              {f.display_name}
              <span className="friendmeta">{isInvited ? 'pode marcar' : 'só vê'}</span>
            </span>
            <button
              type="button"
              className={`friendbtn ${isInvited ? 'ghost' : ''}`}
              disabled={busy === f.id}
              onClick={() => toggle(f.id, isInvited)}
            >
              {isInvited ? 'Tirar' : (
                <>
                  <Icon name="plus" size={15} /> Deixar
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
