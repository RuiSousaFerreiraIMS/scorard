// Acerto de contas no fim do jogo: quem paga a quem, com o mínimo de
// transferências, e um botão para mandar tudo escrito para o grupo.
// A app não move dinheiro — só tira o trabalho de perceber quem deve a quem.

import { getGame } from '../core/gameRegistry';
import { deriveState } from '../core/session';
import { settleUp, buildSettleText } from '../core/settle';
import { Eyebrow } from './components.jsx';
import { Icon } from './icons.jsx';

export default function Settlement({ session }) {
  const game = getGame(session.gameId);
  if (!game || typeof game.getSettlement !== 'function') return null;

  const state = deriveState(session, game);
  const entries = game.getSettlement(state);
  if (!entries || entries.length === 0) return null;

  const transfers = settleUp(entries);

  const share = async () => {
    const text = buildSettleText(transfers);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Scorard · acerto de contas', text });
        return;
      }
    } catch {
      /* cancelado → tenta copiar */
    }
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      /* ignora */
    }
    window.prompt('Copia o acerto:', text);
  };

  return (
    <>
      <div className="mt-lg" />
      <Eyebrow style={{ marginBottom: 10 }}>Acerto de contas</Eyebrow>

      {transfers.length === 0 ? (
        <div className="settle-none">Ninguém deve nada. Contas certas!</div>
      ) : (
        <>
          <div className="hint" style={{ marginBottom: 10 }}>
            {transfers.length === 1
              ? 'Basta 1 transferência para ficar tudo acertado.'
              : `Bastam ${transfers.length} transferências para ficar tudo acertado.`}
          </div>

          {transfers.map((t, i) => (
            <div key={i} className="settle-row">
              <span className="settle-from">{t.fromName}</span>
              <span className="settle-arrow" aria-label="paga a">
                <Icon name="chevron" size={16} />
              </span>
              <span className="settle-to">{t.toName}</span>
              <span className="settle-amt">{t.amount.toFixed(2)} €</span>
            </div>
          ))}

          <button type="button" className="btn btn-ghost" onClick={share}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="share" size={17} /> Enviar acerto ao grupo
            </span>
          </button>
        </>
      )}
    </>
  );
}
