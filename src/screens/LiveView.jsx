// Sessão ao vivo: quem abre o link acompanha em tempo real.
// Quem tem permissão (dono ou jogador convidado) também marca as rondas.
// Quem tem conta pode comentar. Sem conta: vê tudo, e é convidado a criar conta.

import { useEffect, useRef, useState } from 'react';
import { getGame } from '../core/gameRegistry';
import { deriveState } from '../core/session';
import {
  fetchLive,
  fetchPlayers,
  fetchComments,
  postComment,
  pushRounds,
  subscribeLive,
} from '../core/live';
import { useAuth } from '../core/useAuth';
import { Eyebrow, Card, Button, toneClass } from '../ui/components.jsx';
import { Icon } from '../ui/icons.jsx';

export default function LiveView({ id }) {
  const { user, ready } = useAuth();
  const [live, setLive] = useState(null);
  const [players, setPlayers] = useState([]);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [gone, setGone] = useState(false);
  const endRef = useRef(null);

  // carregar + ligar ao tempo real
  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await fetchLive(id);
      if (!alive) return;
      if (!s) {
        setGone(true);
        setLoading(false);
        return;
      }
      setLive(s);
      setPlayers(await fetchPlayers(id));
      setComments(await fetchComments(id));
      setLoading(false);
    })();

    const off = subscribeLive(id, {
      onSession: (s) => setLive(s),
      onComment: (c) => setComments((cs) => (cs.some((x) => x.id === c.id) ? cs : [...cs, c])),
    });

    return () => {
      alive = false;
      off();
    };
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [comments.length]);

  const openApp = () => {
    location.href = location.origin + location.pathname;
  };

  if (loading || !ready) return <div className="settle-none">A ligar à sessão…</div>;

  if (gone) {
    return (
      <>
        <Eyebrow>Scorard</Eyebrow>
        <h2>Sessão não encontrada</h2>
        <p className="sub">O link pode ter expirado ou o jogo já foi apagado.</p>
        <Button onClick={openApp}>Abrir a Scorard</Button>
      </>
    );
  }

  const game = getGame(live.gameId);
  if (!game) {
    return (
      <>
        <Eyebrow>Scorard</Eyebrow>
        <h2>Jogo desconhecido</h2>
        <Button onClick={openApp}>Abrir a Scorard</Button>
      </>
    );
  }

  const state = deriveState(live, game);
  const standings = game.getStandings(state);
  const canEdit = !!user && (user.id === live.ownerId || players.includes(user.id));
  const finished = game.isFinished(state) || live.finished;

  const submitRound = async (input) => {
    const rounds = [...live.rounds, input];
    setLive({ ...live, rounds }); // otimista: mexe já, o servidor confirma
    const st = deriveState({ ...live, rounds }, game);
    await pushRounds(id, rounds, game.isFinished(st));
  };

  const send = async () => {
    const body = text.trim();
    if (!body || !user) return;
    setText('');
    const name = (user.email || 'alguém').split('@')[0];
    const ok = await postComment(id, user, name, body);
    if (!ok) setText(body); // falhou: devolve o texto para não se perder
  };

  const RoundInput = game.RoundInput;

  return (
    <>
      <div className="livebar">
        <span className="livedot" /> Ao vivo · {game.name}
        {canEdit && <span className="livetag">podes marcar</span>}
      </div>

      {canEdit && !finished ? (
        <RoundInput game={game} state={state} onSubmit={submitRound} />
      ) : (
        <>
          <Eyebrow style={{ marginBottom: 10 }}>
            {finished ? 'Fim de jogo' : `Ronda ${state.roundIndex + 1} · a decorrer`}
          </Eyebrow>
          {standings.map((p, i) => (
            <Card key={p.playerId} className={`row rrow ${i === 0 ? 'top' : ''}`}>
              <span className={`rank ${i === 0 ? 'top' : ''}`}>{i === 0 ? '★' : i + 1}</span>
              <span style={{ flex: 1 }}>
                <span className="rname">{p.name}</span>
                {p.detail && <span className="rdetail">{p.detail}</span>}
              </span>
              <span className={`rmoney ${toneClass(p)}`}>{p.scoreLabel}</span>
            </Card>
          ))}
        </>
      )}

      <div className="mt-lg" />
      <Eyebrow style={{ marginBottom: 10 }}>
        Comentários {comments.length > 0 ? `(${comments.length})` : ''}
      </Eyebrow>

      {comments.length === 0 && (
        <div className="settle-none">Ainda sem comentários. Manda o primeiro!</div>
      )}

      <div className="comments">
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <span className="comment-who">{c.author_name}</span>
            <span className="comment-body">{c.body}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {user ? (
        <div className="commentbox">
          <input
            className="pinput"
            style={{ flex: 1 }}
            placeholder="Escreve algo…"
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button type="button" className="friendbtn" onClick={send} aria-label="Enviar">
            <Icon name="share" size={16} />
          </button>
        </div>
      ) : (
        <Card style={{ textAlign: 'center', borderColor: 'var(--goldDim)' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Queres comentar?</div>
          <div className="sub" style={{ margin: '0 0 12px' }}>
            Cria conta na Scorard — é grátis e ficas com os teus jogos guardados.
          </div>
          <Button onClick={openApp}>Abrir a Scorard</Button>
        </Card>
      )}
    </>
  );
}
