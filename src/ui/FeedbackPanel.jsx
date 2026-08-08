// "O teu jogo não está aqui?" — sugerir um jogo, uma ideia ou reportar um problema.
// Guarda na base de dados; se não der, oferece mandar por email.

import { useState } from 'react';
import { sendFeedback, mailtoLink } from '../core/feedback';
import { Eyebrow, Button } from './components.jsx';

const TIPOS = [
  { key: 'jogo', label: 'Sugerir um jogo' },
  { key: 'ideia', label: 'Dar uma ideia' },
  { key: 'problema', label: 'Reportar um problema' },
];

export default function FeedbackPanel({ user, onClose }) {
  const [kind, setKind] = useState('jogo');
  const [gameName, setGameName] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState(null); // 'ok' | 'offline'

  const enviar = async () => {
    setBusy(true);
    const res = await sendFeedback({ kind, body, gameName, user });
    setBusy(false);
    if (res === 'vazio') return;
    setState(res);
  };

  if (state === 'ok') {
    return (
      <div className="invitepanel">
        <Eyebrow>Obrigado!</Eyebrow>
        <p className="sub" style={{ margin: '8px 0 14px' }}>
          A tua sugestão foi guardada. Se for um jogo que dê para marcar pontos, há boa
          hipótese de aparecer por aqui.
        </p>
        <Button onClick={onClose}>Fechar</Button>
      </div>
    );
  }

  if (state === 'offline') {
    return (
      <div className="invitepanel">
        <Eyebrow>Sem ligação</Eyebrow>
        <p className="sub" style={{ margin: '8px 0 14px' }}>
          Não deu para guardar agora. Podes mandar por email — vai já escrito.
        </p>
        <a className="btn btn-primary" href={mailtoLink({ kind, body, gameName })}>
          Enviar por email
        </a>
        <Button variant="ghost" onClick={() => setState(null)}>
          Tentar outra vez
        </Button>
      </div>
    );
  }

  return (
    <div className="invitepanel">
      <div className="invitehead">
        <Eyebrow>O teu jogo não está aqui?</Eyebrow>
        <button type="button" className="premove" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>

      <div className="hint" style={{ marginBottom: 12 }}>
        Diz-nos qual é e como se contam os pontos. É assim que a lista cresce.
      </div>

      <div className="rosterwrap" style={{ marginBottom: 12 }}>
        {TIPOS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`friendchip ${kind === t.key ? 'hasaccount' : ''}`}
            style={kind === t.key ? { color: 'var(--gold)' } : { color: 'var(--textDim)' }}
            onClick={() => setKind(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {kind === 'jogo' && (
        <input
          className="pinput"
          style={{ width: '100%', marginBottom: 10 }}
          placeholder="Nome do jogo (ex: Bisca, Rouba-montes)"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
        />
      )}

      <textarea
        className="pinput feedbacktext"
        placeholder={
          kind === 'jogo'
            ? 'Como se contam os pontos? Quantos jogadores? Quem ganha?'
            : 'Conta lá…'
        }
        value={body}
        maxLength={2000}
        onChange={(e) => setBody(e.target.value)}
      />

      <Button disabled={busy || !body.trim()} onClick={enviar}>
        {busy ? 'A enviar…' : 'Enviar'}
      </Button>
    </div>
  );
}
