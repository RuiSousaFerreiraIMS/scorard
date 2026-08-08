// Componentes de UI reutilizáveis (comuns a todos os ecrãs).

import { Icon } from './icons.jsx';

export function Button({ children, onClick, variant = 'primary', disabled, type = 'button' }) {
  const cls =
    variant === 'ghost' ? 'btn-ghost' : variant === 'danger' ? 'btn-danger' : 'btn-primary';
  return (
    <button type={type} className={`btn ${cls}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Eyebrow({ children, style }) {
  return (
    <div className="eyebrow" style={style}>
      {children}
    </div>
  );
}

export function Card({ children, className = '', onClick, style }) {
  return (
    <div className={`card ${className}`} onClick={onClick} style={style}>
      {children}
    </div>
  );
}

export function BackButton({ onClick, label = 'Voltar' }) {
  return (
    <button type="button" className="iconbtn backbtn" onClick={onClick} aria-label={label}>
      <Icon name="back" size={22} />
    </button>
  );
}

// "4 jogadores" quando é número fixo; "2–20 jogadores" quando há intervalo.
export function playersLabel(game) {
  const { minPlayers: min, maxPlayers: max } = game;
  return min === max ? `${min} jogadores` : `${min}–${max} jogadores`;
}

// Cor do valor de dinheiro conforme sinal.
export function moneyClass(score) {
  return score > 0 ? 'pos' : score < 0 ? 'neg' : 'dim';
}

// Cor de um item de standings: usa o 'tone' do jogo se existir, senão o sinal.
export function toneClass(entry) {
  if (entry.tone === 'gold') return 'goldtxt';
  if (entry.tone === 'pos') return 'pos';
  if (entry.tone === 'neg') return 'neg';
  if (entry.tone === 'dim') return 'dim';
  return moneyClass(entry.score);
}
