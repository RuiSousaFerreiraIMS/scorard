import { getGame } from '../core/gameRegistry';
import { deriveState } from '../core/session';
import { Eyebrow, Button, BackButton } from '../ui/components.jsx';

// Moldura genérica de jogo. O miolo do input é do jogo (game.RoundInput);
// tudo o resto — desfazer, histórico da sessão, terminar — é comum.
export default function GameScreen({
  session,
  onSubmitRound,
  onUndo,
  onFinish,
  onBack,
  onShareLive,
  onGoLive,
  onShareLiveUrl,
}) {
  const game = getGame(session.gameId);
  const state = deriveState(session, game);
  const RoundInput = game.RoundInput;
  const rounds = session.rounds;
  const finished = game.isFinished(state);

  const confirmFinish = () => {
    if (window.confirm('Terminar jogo e mostrar as contas finais?')) onFinish();
  };

  return (
    <>
      <BackButton onClick={onBack} />

      {finished ? (
        <div className="card roundcard" style={{ textAlign: 'center' }}>
          <div className="eyebrow">Jogo terminado</div>
          <div className="roundval" style={{ fontSize: 24 }}>Alguém chegou a 0</div>
          <Button onClick={onFinish}>Ver contas finais</Button>
        </div>
      ) : (
        // key por nº de rondas: força recomeçar o input a cada ronda (reset limpo)
        <RoundInput key={rounds.length} game={game} state={state} onSubmit={onSubmitRound} />
      )}

      <div className="mt-lg" />
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 0 }}
          onClick={onUndo}
          disabled={rounds.length === 0}
        >
          ↶ Desfazer ronda
        </button>
        <button type="button" className="btn btn-danger" style={{ marginTop: 0 }} onClick={confirmFinish}>
          Terminar jogo
        </button>
      </div>

      {session.liveId ? (
        <button type="button" className="btn btn-ghost" onClick={onShareLiveUrl}>
          <span className="livedot" style={{ display: 'inline-block', marginRight: 8 }} />
          Ao vivo — partilhar link outra vez
        </button>
      ) : (
        onGoLive && (
          <button type="button" className="btn btn-ghost" onClick={onGoLive}>
            📡 Pôr ao vivo (amigos acompanham e comentam)
          </button>
        )
      )}

      {onShareLive && rounds.length > 0 && (
        <button type="button" className="btn btn-ghost" onClick={onShareLive}>
          🔗 Partilhar sessão (foto do momento)
        </button>
      )}

      {rounds.length > 0 && (
        <>
          <div className="mt-lg" />
          <Eyebrow style={{ marginBottom: 10 }}>Histórico da sessão</Eyebrow>
          {rounds
            .map((input, i) => ({ input, n: i + 1 }))
            .reverse()
            .map(({ input, n }) => (
              <div key={n} className="hrow">
                <span className="hround">R{n}</span>
                <span className="hdetail">
                  {game.roundSummary ? game.roundSummary(input, n - 1, session.players) : `ronda ${n}`}
                </span>
              </div>
            ))}
        </>
      )}
    </>
  );
}
