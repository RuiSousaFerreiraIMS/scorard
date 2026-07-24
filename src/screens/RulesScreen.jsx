// Regras de um jogo (secções curtas). Acessível a partir do detalhe.

import { getGame } from '../core/gameRegistry';
import { Icon } from '../ui/icons.jsx';

export default function RulesScreen({ gameId, onBack, onStart }) {
  const game = getGame(gameId);
  if (!game) return null;
  const rules = game.rules || [];

  return (
    <>
      <div className="detail-top">
        <button type="button" className="iconbtn" onClick={onBack} aria-label="Voltar">
          <Icon name="back" size={22} />
        </button>
      </div>

      <div className="eyebrow">Como se joga</div>
      <h1 style={{ margin: '4px 0 2px' }}>{game.name}</h1>
      <p className="sub">Regras e pontuação, em resumo.</p>

      {rules.map((r, i) => (
        <div key={i} className="rule">
          <div className="rule-h">{r.h}</div>
          <p className="rule-p">{r.p}</p>
        </div>
      ))}

      <div className="mt-lg" />
      <button type="button" className="btn btn-primary" onClick={() => onStart(gameId)}>
        Iniciar pontuação
      </button>
    </>
  );
}
