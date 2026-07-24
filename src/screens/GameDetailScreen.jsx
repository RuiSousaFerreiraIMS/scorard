// Detalhe de um jogo: apresentação, dificuldade, jogadores, descrição, curiosidade.
// Estrela de favorito no canto; dois botões principais: Regras e Iniciar pontuação.

import { getGame } from '../core/gameRegistry';
import { Icon } from '../ui/icons.jsx';

export default function GameDetailScreen({ gameId, isFav, onToggleFav, onStart, onRules, onBack }) {
  const game = getGame(gameId);
  if (!game) return null;

  const isCopas = game.suit === '♥';

  return (
    <>
      <div className="detail-top">
        <button type="button" className="iconbtn" onClick={onBack} aria-label="Voltar">
          <Icon name="back" size={22} />
        </button>
        <button
          type="button"
          className={`iconbtn ${isFav ? 'fav-on' : ''}`}
          onClick={() => onToggleFav(gameId)}
          aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFav}
        >
          <Icon name="star" size={22} filled={isFav} />
        </button>
      </div>

      <div className="detail-hero">
        <div className={`detail-suit ${isCopas ? 'copas' : ''}`}>{game.suit || '♠'}</div>
        <h1 style={{ margin: '10px 0 2px' }}>{game.name}</h1>
        <div className="detail-meta">
          <span className="chip-meta">
            <Icon name="amigos" size={15} /> {game.minPlayers}–{game.maxPlayers} jogadores
          </span>
          <span className="chip-meta">{game.difficulty}</span>
        </div>
      </div>

      <p className="detail-desc">{game.longDescription || game.description}</p>

      {game.curiosity && (
        <div className="curiosity">
          <div className="curiosity-label">Curiosidade</div>
          <p style={{ margin: 0 }}>{game.curiosity}</p>
        </div>
      )}

      <div className="detail-actions">
        <button type="button" className="btn btn-ghost" style={{ marginTop: 0 }} onClick={onRules}>
          Regras
        </button>
        <button type="button" className="btn btn-primary" style={{ marginTop: 0 }} onClick={() => onStart(gameId)}>
          Iniciar pontuação
        </button>
      </div>
    </>
  );
}
