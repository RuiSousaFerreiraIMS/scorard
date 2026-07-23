import { useState } from 'react';
import { getGame } from '../core/gameRegistry';
import { deriveState, deriveStepStates } from '../core/session';
import { formatDateTime } from '../core/format';
import { Eyebrow, Card, Button, BackButton, moneyClass } from '../ui/components.jsx';

// Histórico comum a todos os jogos: lista de sessões terminadas + detalhe
// ronda-a-ronda (derivado dos rounds, sem código específico do jogo).
export default function HistoryScreen({ history, onBack, onRemove, onShare }) {
  const [openId, setOpenId] = useState(null);
  const open = history.find((s) => s.id === openId);

  if (open) {
    return <Detail session={open} onBack={() => setOpenId(null)} onShare={onShare} />;
  }

  return (
    <>
      <BackButton onClick={onBack} />
      <Eyebrow>Histórico</Eyebrow>
      <h2>Jogos guardados</h2>

      {history.length === 0 && (
        <p className="sub" style={{ marginTop: 12 }}>
          Ainda não há jogos guardados. Termina um jogo para ele aparecer aqui.
        </p>
      )}

      {history.map((s) => {
        const game = getGame(s.gameId);
        if (!game) return null;
        const standings = game.getStandings(deriveState(s, game));
        const winner = standings[0];
        return (
          <Card key={s.id} className="row tappable" onClick={() => setOpenId(s.id)}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{game.name}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
                {formatDateTime(s.finishedAt || s.startedAt)} · {s.players.length} jogadores ·{' '}
                {s.rounds.length} {s.rounds.length === 1 ? 'ronda' : 'rondas'}
              </div>
              {winner && (
                <div style={{ color: 'var(--gold)', fontSize: 13, marginTop: 4, fontWeight: 600 }}>
                  🏆 {winner.name} · {winner.scoreLabel}
                </div>
              )}
            </div>
            <div style={{ color: 'var(--gold)', fontSize: 30 }}>›</div>
          </Card>
        );
      })}
    </>
  );
}

function Detail({ session, onBack, onShare }) {
  const game = getGame(session.gameId);
  const finalState = deriveState(session, game);
  const standings = game.getStandings(finalState);
  const steps = deriveStepStates(session, game);

  return (
    <>
      <BackButton onClick={onBack} children="‹ Histórico" />
      <Eyebrow>{game.name}</Eyebrow>
      <h2>Contas finais</h2>
      <p className="sub">
        {formatDateTime(session.finishedAt || session.startedAt)} · {session.rounds.length}{' '}
        {session.rounds.length === 1 ? 'ronda' : 'rondas'}
      </p>

      {standings.map((p, i) => (
        <Card key={p.playerId} className={`row rrow ${i === 0 ? 'top' : ''}`}>
          <span className={`rank ${i === 0 ? 'top' : ''}`}>{i + 1}</span>
          <span className="rname">{p.name}</span>
          <span className={`rmoney ${moneyClass(p.score)}`}>{p.scoreLabel}</span>
        </Card>
      ))}

      {session.rounds.length > 0 && (
        <>
          <div className="mt-lg" />
          <Eyebrow style={{ marginBottom: 10 }}>Ronda a ronda</Eyebrow>
          {session.rounds.map((input, i) => {
            // estado ANTES desta ronda (para o cabeçalho: nº de cartas, valor…)
            const before = i === 0 ? game.createState(session.players, session.setup) : steps[i - 1];
            const cfg = game.getRoundConfig(before);
            return (
              <div key={i} className="hrow">
                <span className="hround">R{i + 1}</span>
                <span className="hdetail">
                  {game.roundSummary ? game.roundSummary(input, i, session.players) : `ronda ${i + 1}`}
                </span>
                {typeof cfg.cards === 'number' && (
                  <span className="hresult dim">
                    {cfg.cards} carta{cfg.cards > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            );
          })}
        </>
      )}

      <div className="mt-xl" />
      <Button variant="ghost" onClick={() => onShare(session)}>
        Partilhar resultado
      </Button>
    </>
  );
}
