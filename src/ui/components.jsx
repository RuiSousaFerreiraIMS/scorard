// Componentes de UI reutilizáveis (comuns a todos os ecrãs).

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

export function BackButton({ onClick, children = '‹ Menu' }) {
  return (
    <button type="button" className="back" onClick={onClick}>
      {children}
    </button>
  );
}

// Cor do valor de dinheiro conforme sinal.
export function moneyClass(score) {
  return score > 0 ? 'pos' : score < 0 ? 'neg' : 'dim';
}
