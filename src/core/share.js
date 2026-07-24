// Partilha de resultado (comum a todos os jogos): texto para o WhatsApp & afins.
// Usa a Web Share API do telemóvel quando existe; senão copia para a área de
// transferência; senão mostra um prompt. Nunca rebenta.

import { getGame } from './gameRegistry';
import { deriveState } from './session';
import { formatDate } from './format';
import { buildShareUrl } from './shareLink';

export function buildResultText(session) {
  const game = getGame(session.gameId);
  const standings = game.getStandings(deriveState(session, game));
  const lines = [
    `🃏 Scorard · ${game.name}`,
    formatDate(session.finishedAt || session.startedAt),
    '',
    ...standings.map((p, i) => {
      const medal = i === 0 ? '🏆 ' : `${i + 1}. `;
      return `${medal}${p.name} — ${p.scoreLabel}`;
    }),
  ];
  return lines.join('\n');
}

// Partilha um link só-de-leitura para acompanhar a sessão (vista + promoção).
export async function shareSessionLink(session) {
  const game = getGame(session.gameId);
  const url = buildShareUrl(session);
  const text = `Acompanha o nosso ${game.name} na Scorard 👀`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Scorard', text, url });
      return 'shared';
    }
  } catch {
    // cancelado ou falhou → tenta copiar
  }
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      return 'copied';
    }
  } catch {
    /* ignora */
  }
  try {
    window.prompt('Copia o link para acompanhar o jogo:', url);
  } catch {
    /* ignora */
  }
  return 'prompt';
}

export async function shareResult(session) {
  const text = buildResultText(session);
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Scorard', text });
      return 'shared';
    }
  } catch {
    // utilizador cancelou ou API falhou → tenta copiar
  }
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    /* ignora */
  }
  try {
    window.prompt('Copia o resultado:', text);
  } catch {
    /* ignora */
  }
  return 'prompt';
}
