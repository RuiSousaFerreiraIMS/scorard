import { listGames, getGame } from '../core/gameRegistry';
import { deriveState } from '../core/session';
import { Card, Eyebrow } from '../ui/components.jsx';
import InstallBanner from '../ui/InstallBanner.jsx';

export default function HomeScreen({ onPickGame, activeSession, onResume, historyCount, onHistory }) {
  const games = listGames();

  let resumeInfo = null;
  if (activeSession) {
    const game = getGame(activeSession.gameId);
    if (game) {
      const state = deriveState(activeSession, game);
      resumeInfo = {
        gameName: game.name,
        players: activeSession.players.length,
        round: state.roundIndex + 1,
      };
    }
  }

  return (
    <>
      <Eyebrow>Contas de jogo</Eyebrow>
      <h1>Scorard</h1>
      <p className="sub">Escolhe o jogo. As contas fazem-se sozinhas.</p>

      <InstallBanner />

      {resumeInfo && (
        <>
          <Eyebrow style={{ marginBottom: 10 }}>Continuar</Eyebrow>
          <Card className="row tappable" onClick={onResume} style={{ borderColor: 'var(--goldDim)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{resumeInfo.gameName}</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 3 }}>
                {resumeInfo.players} jogadores · ronda {resumeInfo.round}
              </div>
            </div>
            <div style={{ color: 'var(--gold)', fontSize: 30 }}>›</div>
          </Card>
          <div className="mt-lg" />
        </>
      )}

      <Eyebrow style={{ marginBottom: 10 }}>Jogos</Eyebrow>
      {games.map((g) => (
        <Card key={g.id} className="row tappable" onClick={() => onPickGame(g.id)}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{g.name}</div>
            <div className="muted" style={{ fontSize: 14, marginTop: 3 }}>{g.description}</div>
            <div style={{ color: 'var(--goldDim)', fontSize: 12, marginTop: 6, fontWeight: 600 }}>
              {g.minPlayers}–{g.maxPlayers} jogadores
            </div>
          </div>
          <div style={{ color: 'var(--gold)', fontSize: 30 }}>›</div>
        </Card>
      ))}

      <div className="mt-lg" />
      <Eyebrow style={{ marginBottom: 10 }}>Histórico</Eyebrow>
      <Card className="row tappable" onClick={onHistory}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Jogos guardados</div>
          <div className="muted" style={{ fontSize: 14, marginTop: 3 }}>
            {historyCount > 0
              ? `${historyCount} ${historyCount > 1 ? 'jogos guardados' : 'jogo guardado'}`
              : 'Ainda sem jogos guardados'}
          </div>
        </div>
        <div style={{ color: 'var(--gold)', fontSize: 30 }}>›</div>
      </Card>

      <p className="footer">Mais jogos em breve.</p>
    </>
  );
}
