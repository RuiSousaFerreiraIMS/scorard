import { getGame } from '../core/gameRegistry';
import { deriveState } from '../core/session';
import { Eyebrow, Card, Button, toneClass } from '../ui/components.jsx';

export default function ResultsScreen({ session, onNewGame, onHome, onShare }) {
  const game = getGame(session.gameId);
  const state = deriveState(session, game);
  const standings = game.getStandings(state);
  const rounds = session.rounds.length;

  return (
    <>
      <Eyebrow>Fim de jogo</Eyebrow>
      <h2>Contas finais</h2>
      <p className="sub">
        {game.name} · {rounds} {rounds === 1 ? 'ronda' : 'rondas'}
      </p>

      {standings.map((p, i) => {
        const top = i === 0;
        return (
          <Card key={p.playerId} className={`row rrow ${top ? 'top' : ''}`}>
            <span className={`rank ${top ? 'top' : ''}`}>{i + 1}</span>
            <span style={{ flex: 1 }}>
              <span className="rname">{p.name}</span>
              {p.detail && <span className="rdetail">{p.detail}</span>}
            </span>
            <span className={`rmoney ${toneClass(p)}`}>{p.scoreLabel}</span>
          </Card>
        );
      })}

      <div className="mt-xl" />
      <Button onClick={onShare} variant="ghost">
        Partilhar resultado
      </Button>
      <Button onClick={onNewGame}>Novo jogo</Button>
      <Button onClick={onHome} variant="ghost">
        Menu principal
      </Button>
    </>
  );
}
