// Casca da app: área de conteúdo + barra de navegação de fundo (tab bar).
// A tab bar mostra-se nos separadores (Jogar/Histórico/Perfil) e esconde-se
// durante o fluxo de jogo (setup/jogo/resultados) para dar foco e espaço.

import { Icon } from './icons.jsx';

const TABS = [
  { key: 'jogar', label: 'Jogar', icon: 'jogar' },
  { key: 'historico', label: 'Histórico', icon: 'historico' },
  { key: 'perfil', label: 'Perfil', icon: 'perfil' },
];

export default function AppShell({ tab, onTab, showTabBar, children }) {
  if (!showTabBar) return children;

  return (
    <>
      <div className="tab-content">{children}</div>
      <nav className="tabbar" aria-label="Navegação principal">
        <div className="tabbar-inner">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                className={`tabitem ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onTab(t.key)}
              >
                <Icon name={t.icon} size={23} strokeWidth={active ? 2 : 1.7} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
