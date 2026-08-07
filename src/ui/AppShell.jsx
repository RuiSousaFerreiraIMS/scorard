// Casca da app: área de conteúdo + barra de navegação de fundo (tab bar).
// A tab bar mostra-se nos separadores (Jogar/Histórico/Perfil) e esconde-se
// durante o fluxo de jogo (setup/jogo/resultados) para dar foco e espaço.

import { Icon } from './icons.jsx';

const BASE_TABS = [
  { key: 'jogar', label: 'Jogar', icon: 'jogar' },
  { key: 'historico', label: 'Histórico', icon: 'historico' },
  { key: 'perfil', label: 'Perfil', icon: 'perfil' },
];

// O separador Amigos só aparece com sessão iniciada — sem conta não há amigos.
const FRIENDS_TAB = { key: 'amigos', label: 'Amigos', icon: 'amigos' };

export default function AppShell({ tab, onTab, showTabBar, showFriends, children }) {
  if (!showTabBar) return children;

  const TABS = showFriends
    ? [BASE_TABS[0], BASE_TABS[1], FRIENDS_TAB, BASE_TABS[2]]
    : BASE_TABS;

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
