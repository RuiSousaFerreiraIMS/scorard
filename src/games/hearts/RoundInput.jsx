// Input de uma mão de Copas: quantos pontos apanhou cada um.
// O total tem de dar 26 — a app avisa enquanto não der, para não entrar erro.
// Há um atalho para o pleno, que é a jogada que mais confunde as contas.

import { useState } from 'react';
import { HAND_TOTAL, applyMoon } from './index.js';
import { Button, Eyebrow } from '../../ui/components.jsx';

export default function RoundInput({ game, state, onSubmit }) {
  const [points, setPoints] = useState({});
  const [moonPicker, setMoonPicker] = useState(false);

  const get = (id) => Number(points[id]) || 0;
  const sum = state.scores.reduce((t, p) => t + get(p.playerId), 0);
  const ok = sum === HAND_TOTAL;

  const bump = (id, d) => {
    const v = Math.max(0, Math.min(HAND_TOTAL, get(id) + d));
    setPoints((p) => ({ ...p, [id]: v }));
  };

  const submitMoon = (playerId) => {
    onSubmit({ points: applyMoon(state.players, playerId), moonBy: playerId });
    setPoints({});
    setMoonPicker(false);
  };

  return (
    <>
      <div className="sd-bar">
        <div className="sd-bar-title">Pontos · ganha quem tiver menos</div>
        <div className="sd-bar-row">
          {[...state.scores]
            .sort((a, b) => a.pts - b.pts)
            .map((p, i) => (
              <div
                key={p.playerId}
                className={`sd-chip ${i === 0 ? 'lead' : ''} ${
                  p.pts >= state.targetScore - 20 ? 'danger' : ''
                }`}
              >
                <div className="sd-chip-n">{p.name}</div>
                <div className="sd-chip-v">{p.pts}</div>
              </div>
            ))}
        </div>
      </div>

      <Eyebrow>Mão {state.roundIndex + 1}</Eyebrow>

      {moonPicker ? (
        <>
          <div className="qlabel">Quem fez o pleno?</div>
          <div className="qhelp">Fica a zero; cada um dos outros leva 26.</div>
          {state.players.map((p) => (
            <button key={p.id} type="button" className="chip" onClick={() => submitMoon(p.id)}>
              {p.name}
            </button>
          ))}
          <Button variant="ghost" onClick={() => setMoonPicker(false)}>
            Afinal não
          </Button>
        </>
      ) : (
        <>
          <div className="qlabel">Pontos de cada um</div>
          <div className="qhelp">Copas 1 cada, dama de espadas 13. Total tem de dar 26.</div>

          {state.scores.map((p) => (
            <div key={p.playerId} className="vrow">
              <div className="vname">{p.name}</div>
              <button type="button" className="vstep" onClick={() => bump(p.playerId, -1)}>
                −
              </button>
              <div className="vval">{get(p.playerId)}</div>
              <button type="button" className="vstep" onClick={() => bump(p.playerId, 1)}>
                +
              </button>
              <button
                type="button"
                className="vstep"
                onClick={() => bump(p.playerId, 13)}
                title="Dama de espadas"
              >
                +13
              </button>
            </div>
          ))}

          <div className={`vsum ${ok ? '' : 'bad'}`}>
            Total: {sum} / {HAND_TOTAL}
          </div>

          <div className="mt" />
          <Button disabled={!ok} onClick={() => { onSubmit({ points }); setPoints({}); }}>
            Registar mão
          </Button>
          <Button variant="ghost" onClick={() => setMoonPicker(true)}>
            🌙 Alguém fez o pleno
          </Button>
        </>
      )}
    </>
  );
}
