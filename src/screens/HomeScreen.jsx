// Separador Jogar: cabeçalho, cartão de continuar, fila horizontal de
// recentes/favoritos (estilo Netflix) e grelha de todos os jogos. Tocar num
// jogo abre o detalhe.

import { listGames, getGame } from '../core/gameRegistry';
import { deriveState } from '../core/session';
import { recentGameIds } from '../core/favorites';
import { Icon } from '../ui/icons.jsx';

export default function HomeScreen({
  onOpenDetail,
  activeSession,
  onResume,
  favorites,
  onToggleFav,
  history,
}) {
  const games = listGames();

  let resumeInfo = null;
  if (activeSession) {
    const game = getGame(activeSession.gameId);
    if (game) {
      const state = deriveState(activeSession, game);
      resumeInfo = {
        gameName: game.name,
        suit: game.suit,
        players: activeSession.players.length,
        round: state.roundIndex + 1,
      };
    }
  }

  // fila horizontal: favoritos primeiro, depois recentes (sem repetir)
  const recent = recentGameIds(history, activeSession);
  const railIds = [...favorites, ...recent].filter(
    (id, i, arr) => arr.indexOf(id) === i && getGame(id),
  );

  return (
    <>
      <header className="apphead">
        <span className="wordmark">Scorard</span>
        <span className="avatar">RF</span>
      </header>

      {resumeInfo && (
        <button
          type="button"
          className="continue-card"
          onClick={onResume}
        >
          <span className="continue-live">
            <Icon name="live" size={15} /> Continuar
          </span>
          <span className="continue-title">{resumeInfo.gameName}</span>
          <span className="continue-sub">
            {resumeInfo.players} jogadores · ronda {resumeInfo.round}
          </span>
        </button>
      )}

      {railIds.length > 0 && (
        <>
          <div className="section-h">Recentes e favoritos</div>
          <div className="rail">
            {railIds.map((id) => {
              const g = getGame(id);
              const fav = favorites.includes(id);
              return (
                <button key={id} type="button" className="rail-tile" onClick={() => onOpenDetail(id)}>
                  <span className={`rail-suit ${g.suit === '♥' ? 'copas' : ''}`}>{g.suit}</span>
                  <span className="rail-name">{g.name}</span>
                  {fav && (
                    <span className="rail-star">
                      <Icon name="star" size={13} filled />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="section-h">Todos os jogos</div>
      <div className="game-grid">
        {games.map((g) => {
          const fav = favorites.includes(g.id);
          return (
            <div key={g.id} className="game-card" onClick={() => onOpenDetail(g.id)}>
              <button
                type="button"
                className={`game-star ${fav ? 'on' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFav(g.id);
                }}
                aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                aria-pressed={fav}
              >
                <Icon name="star" size={18} filled={fav} />
              </button>
              <span className={`game-suit ${g.suit === '♥' ? 'copas' : ''}`}>{g.suit}</span>
              <div className="game-name">{g.name}</div>
              <div className="game-metaline">
                {g.minPlayers}–{g.maxPlayers} jogadores · {g.difficulty}
              </div>
            </div>
          );
        })}
      </div>

      <p className="footer">Mais jogos em breve.</p>
    </>
  );
}
