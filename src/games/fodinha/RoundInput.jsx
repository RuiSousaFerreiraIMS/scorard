// Input de ronda da Fodinha: marca quem perdeu; os restantes ganham.
// Isto é o que é ESPECÍFICO do jogo. Recebe o estado derivado e devolve um input
// (loserIds) ao GameScreen, que trata do resto (moldura, undo, histórico).

import { useState } from 'react';
import { Card, Eyebrow, Button, moneyClass } from '../../ui/components.jsx';

export default function RoundInput({ game, state, onSubmit }) {
  const [selected, setSelected] = useState([]);
  const round = game.getRoundConfig(state);
  const standings = game.getStandings(state);
  const perfect = selected.length === 0;

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const confirm = () => {
    onSubmit({ loserIds: selected });
    setSelected([]);
  };

  // ordenar por nome para a lista de seleção ser estável
  const players = [...standings].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Card className="roundcard">
        <Eyebrow>{round.label}</Eyebrow>
        <div className="roundval">{fmt(round.value)}</div>
        <div className="roundhelp">
          {perfect
            ? 'Ninguém marcado → ronda perfeita, valor sobe'
            : `${selected.length} a perder · cada um paga ${fmt(round.value)}`}
        </div>
      </Card>

      <div className="mt-lg" />
      <Eyebrow>Quem perdeu esta ronda?</Eyebrow>
      <div className="hint">Toca em quem perdeu. Os restantes ganham.</div>

      {players.map((p) => {
        const isLoser = selected.includes(p.playerId);
        return (
          <button
            key={p.playerId}
            type="button"
            className={`gprow ${isLoser ? 'loser' : ''}`}
            onClick={() => toggle(p.playerId)}
          >
            <span className={`cbox ${isLoser ? 'on' : ''}`}>{isLoser ? '−' : ''}</span>
            <span className="gpname">{p.name}</span>
            <span className={`gpmoney ${moneyClass(p.score)}`}>{p.scoreLabel}</span>
          </button>
        );
      })}

      <div className="mt-lg" />
      <Button onClick={confirm}>
        {perfect ? 'Registar ronda perfeita' : 'Registar ronda'}
      </Button>
    </>
  );
}

function fmt(n) {
  return `${Number(n).toFixed(2)} €`;
}
