// Input de uma mão de King: escolher o contrato e contar o que cada um apanhou.
//
// A app só mostra os contratos que ainda faltam (negativas primeiro), diz quanto
// vale cada unidade e valida o total — no King é fácil enganar-se na contagem, e
// um engano numa mão estraga o jogo todo.

import { useState } from 'react';
import { remainingContracts, getContract, POSITIVA, TOTAL_RONDAS } from './index.js';
import { Button, Eyebrow } from '../../ui/components.jsx';

export default function RoundInput({ game, state, onSubmit }) {
  const restantes = remainingContracts(state);
  const [chosen, setChosen] = useState(restantes.length === 1 ? restantes[0].key : null);
  const [counts, setCounts] = useState({});

  const contract = chosen ? getContract(chosen) : null;
  const get = (id) => Number(counts[id]) || 0;
  const sum = state.scores.reduce((t, p) => t + get(p.playerId), 0);
  const ok = contract ? sum === contract.total : false;

  const bump = (id, d) => {
    if (!contract) return;
    const v = Math.max(0, Math.min(contract.total, get(id) + d));
    setCounts((c) => ({ ...c, [id]: v }));
  };

  const positivasFeitas = state.done.filter((k) => k === POSITIVA.key).length;

  const submit = () => {
    onSubmit({ contract: chosen, counts });
    setCounts({});
    setChosen(null);
  };

  return (
    <>
      <div className="sd-bar">
        <div className="sd-bar-title">Pontos · ganha quem tiver mais</div>
        <div className="sd-bar-row">
          {[...state.scores]
            .sort((a, b) => b.pts - a.pts)
            .map((p, i) => (
              <div key={p.playerId} className={`sd-chip ${i === 0 ? 'lead' : ''}`}>
                <div className="sd-chip-n">{p.name}</div>
                <div className="sd-chip-v" style={p.pts < 0 ? { color: 'var(--neg)' } : undefined}>
                  {p.pts}
                </div>
              </div>
            ))}
        </div>
      </div>

      <Eyebrow>
        Mão {state.roundIndex + 1} de {TOTAL_RONDAS} ·{' '}
        {state.done.length < 6 ? 'negativas' : `positiva ${positivasFeitas + 1} de 4`}
      </Eyebrow>

      {!contract ? (
        <>
          <div className="qlabel">Que mão vão jogar?</div>
          <div className="qhelp">
            {state.done.length < 6
              ? 'Falta jogar estas negativas. Cada uma só se joga uma vez.'
              : 'Agora são as positivas.'}
          </div>
          {restantes.map((c) => (
            <button key={c.key} type="button" className="chip kingchip" onClick={() => setChosen(c.key)}>
              <span>{c.name}</span>
              <span className="kingval">
                {c.per > 0 ? '+' : ''}
                {c.per} × {c.total}
              </span>
            </button>
          ))}
        </>
      ) : (
        <>
          <div className="qlabel">{contract.name}</div>
          <div className="qhelp">{contract.help}</div>

          {state.scores.map((p) => (
            <div key={p.playerId} className="vrow">
              <div className="vname">
                {p.name}
                {get(p.playerId) > 0 && (
                  <span className="kingpts">
                    {get(p.playerId) * contract.per > 0 ? '+' : ''}
                    {get(p.playerId) * contract.per}
                  </span>
                )}
              </div>
              <button type="button" className="vstep" onClick={() => bump(p.playerId, -1)}>
                −
              </button>
              <div className="vval">{get(p.playerId)}</div>
              <button type="button" className="vstep" onClick={() => bump(p.playerId, 1)}>
                +
              </button>
            </div>
          ))}

          <div className={`vsum ${ok ? '' : 'bad'}`}>
            {contract.unit}: {sum} / {contract.total}
          </div>

          <div className="mt" />
          <Button disabled={!ok} onClick={submit}>
            Registar mão
          </Button>
          {restantes.length > 1 && (
            <Button variant="ghost" onClick={() => { setChosen(null); setCounts({}); }}>
              Trocar de mão
            </Button>
          )}
        </>
      )}
    </>
  );
}
