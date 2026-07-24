// Ícones inline (SVG, currentColor). Sem dependências nem CDN — a PWA funciona
// offline. Contorno fino, herdam a cor e o tamanho de quem os usa.

export function Icon({ name, size = 24, strokeWidth = 1.8, filled = false }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  switch (name) {
    case 'star':
      return (
        <svg {...p} fill={filled ? 'currentColor' : 'none'}>
          <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 17.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9z" />
        </svg>
      );
    case 'jogar': // duas cartas sobrepostas
      return (
        <svg {...p}>
          <rect x="3.5" y="7" width="10" height="13.5" rx="2" />
          <path d="M8 5.2l9 2.4a2 2 0 0 1 1.4 2.45l-2.6 9.3" />
        </svg>
      );
    case 'historico': // relógio
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 1.8" />
        </svg>
      );
    case 'perfil': // pessoa
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="3.6" />
          <path d="M5 20c0-3.9 3.1-6.8 7-6.8s7 2.9 7 6.8" />
        </svg>
      );
    case 'amigos': // duas pessoas
      return (
        <svg {...p}>
          <circle cx="9" cy="8.5" r="3" />
          <path d="M3.5 19.5c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
          <path d="M16 5.2a3 3 0 0 1 0 6.1M17.5 14.2c2.3.5 4 2.5 4 5.3" />
        </svg>
      );
    case 'back':
      return (
        <svg {...p}>
          <path d="M15 5l-7 7 7 7" />
        </svg>
      );
    case 'undo':
      return (
        <svg {...p}>
          <path d="M9 7L4 12l5 5" />
          <path d="M4 12h11a5 5 0 0 1 0 10h-1" />
        </svg>
      );
    case 'share':
      return (
        <svg {...p}>
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...p}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'chevron':
      return (
        <svg {...p}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'live': // ponto de sinal
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="3" />
          <path d="M6.5 6.5a8 8 0 0 0 0 11M17.5 6.5a8 8 0 0 1 0 11" />
        </svg>
      );
    case 'install':
      return (
        <svg {...p}>
          <path d="M12 4v10M8 10l4 4 4-4" />
          <path d="M5 19h14" />
        </svg>
      );
    default:
      return null;
  }
}
