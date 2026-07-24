// Vista só-de-leitura de uma sessão partilhada por link (#s=...).
// Não escreve no storage do visitante. Deriva tudo do mesmo motor do jogo.
// Serve também de promoção: termina com uma chamada para abrir a Scorard.

import { getGame } from '../core/gameRegistry';
import { deriveState } from '../core/session';
import { Eyebrow, Card, Button, toneClass } from '../ui/components.jsx';

export default function SharedView({ data }) {
  const game = getGame(data.gameId);

  const openApp = () => {
    // remove o hash e recarrega na app normal
    location.href = location.origin + location.pathname;
  };

  if (!game) {
    return (
      <>
        <Eyebrow>Scorard</Eyebrow>
        <h2>Jogo desconhecido</h2>
        <p className="sub">Este link é de uma versão diferente da app.</p>
        <Button onClick={openApp}>Abrir a Scorard</Button>
      </>
    );
  }

  const session = { ...data, id: 'shared' };
  const state = deriveState(session, game);
  const standings = game.getStandings(state);
  const finished = game.isFinished(state);
  const rounds = session.rounds || [];

  return (
    <>
      <Eyebrow>Scorard · a acompanhar</Eyebrow>
      <h2>{game.name}</h2>
      <p className="sub">
        {finished ? 'Jogo terminado' : `Em curso · ${rounds.length} ${rounds.length === 1 ? 'ronda' : 'rondas'}`}
        {' · '}vista só de leitura
      </p>

      {standings.map((p, i) => (
        <Card key={p.playerId} className={`row rrow ${i === 0 ? 'top' : ''}`}>
          <span className={`rank ${i === 0 ? 'top' : ''}`}>{i + 1}</span>
          <span style={{ flex: 1 }}>
            <span className="rname">{p.name}</span>
            {p.detail && <span className="rdetail">{p.detail}</span>}
          </span>
          <span className={`rmoney ${toneClass(p)}`}>{p.scoreLabel}</span>
        </Card>
      ))}

      {rounds.length > 0 && (
        <>
          <div className="mt-lg" />
          <Eyebrow style={{ marginBottom: 10 }}>Ronda a ronda</Eyebrow>
          {rounds.map((input, i) => (
            <div key={i} className="hrow">
              <span className="hround">R{i + 1}</span>
              <span className="hdetail">
                {game.roundSummary ? game.roundSummary(input, i, session.players) : `ronda ${i + 1}`}
              </span>
            </div>
          ))}
        </>
      )}

      <div className="mt-xl" />
      <Card style={{ textAlign: 'center', borderColor: 'var(--goldDim)' }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Contas de cartas, sem stress</div>
        <div className="sub" style={{ margin: '0 0 12px' }}>
          A Scorard faz as contas por ti. Instala grátis e experimenta.
        </div>
        <Button onClick={openApp}>Abrir a Scorard</Button>
      </Card>
    </>
  );
}
