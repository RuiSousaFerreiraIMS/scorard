// Cartão de instalação no topo da Home.
// - Android/Chrome: botão "Instalar app" que dispara a instalação real.
// - iPhone: botão que abre instruções (Partilhar → Adicionar ao ecrã inicial).
// - Já instalada ou sem suporte: não mostra nada.

import { useState } from 'react';
import { useInstall } from '../core/useInstall';

const DISMISS_KEY = 'scorard:installDismissed';

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}
function setDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* ignora */
  }
}

export default function InstallBanner() {
  const { installed, canInstall, needsManual, promptInstall } = useInstall();
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [hidden, setHidden] = useState(wasDismissed());

  if (installed || hidden) return null;
  if (!canInstall && !needsManual) return null; // nada a oferecer neste browser

  const dismiss = () => {
    setDismissed();
    setHidden(true);
  };

  return (
    <>
      <div className="install">
        <div className="install-icon">📲</div>
        <div className="install-body">
          <div className="install-title">Instalar no telemóvel</div>
          <div className="install-sub">
            {canInstall
              ? 'Fica com ícone no ecrã, abre offline.'
              : 'Adiciona ao ecrã inicial — abre offline, com ícone.'}
          </div>
        </div>
        {canInstall ? (
          <button
            type="button"
            className="install-btn"
            onClick={async () => {
              const outcome = await promptInstall();
              if (outcome === 'accepted') setHidden(true);
            }}
          >
            Instalar
          </button>
        ) : (
          <button type="button" className="install-btn" onClick={() => setShowIosHelp(true)}>
            Como?
          </button>
        )}
        <button type="button" className="install-x" onClick={dismiss} aria-label="Dispensar">
          ×
        </button>
      </div>

      {showIosHelp && (
        <div className="modal-backdrop" onClick={() => setShowIosHelp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Instalar no iPhone</div>
            <p className="modal-sub">A Apple não deixa instalar por botão. São 3 passos rápidos:</p>
            <ol className="steps">
              <li>
                Toca no botão <b>Partilhar</b> <span className="ios-share">⬆︎</span> em baixo, no Safari.
              </li>
              <li>
                Desliza e escolhe <b>“Adicionar ao ecrã inicial”</b>.
              </li>
              <li>
                Toca em <b>Adicionar</b>. Fica com ícone como uma app. ✅
              </li>
            </ol>
            <p className="modal-note">
              Tem de ser no <b>Safari</b> (no Chrome do iPhone a opção não aparece).
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setShowIosHelp(false)}>
              Percebi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
