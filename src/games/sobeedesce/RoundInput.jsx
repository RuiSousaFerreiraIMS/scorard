// Input de ronda do Sobe e Desce: assistente de 3 passos + desempate.
// 1) escolher/virar + trunfo (define o multiplicador)
// 2) quem vai a jogo (obrigatoriedades marcadas automaticamente)
// 3) vazas de cada um (total = 5)
// Se a ronda levar 2+ jogadores a 0, pergunta quem chegou primeiro.

import { useState } from 'react';
import { Button } from '../../ui/components.jsx';
import { SUITS, computeMultiplier, computeDeltas, forcedReason } from './scoring.js';

export default function RoundInput({ game, state, onSubmit }) {
  const chooser = state.scores[state.chooserIndex];
  const chooserId = chooser.playerId;

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null); // 'escolheu' | 'virou'
  const [suit, setSuit] = useState(null);
  const [dark, setDark] = useState(false);
  const [went, setWent] = useState({}); // só para os não-obrigados
  const [tricks, setTricks] = useState({});
  const [firstToZeroId, setFirstToZeroId] = useState(null);

  const draft = { chooserId, suit: dark ? 'copas' : suit, dark };
  const M = computeMultiplier({ suit: dark ? 'copas' : suit, dark });

  // went resolvido: obrigados = sempre true; resto = escolha do utilizador
  const resolvedWent = {};
  for (const p of state.scores) {
    const forced = forcedReason(p, draft, state);
    resolvedWent[p.playerId] = forced ? true : (went[p.playerId] ?? null);
  }

  const buildRound = (extra = {}) => ({
    chooserId,
    mode,
    suit: dark ? 'copas' : suit,
    dark,
    went: { ...resolvedWent },
    tricks: Object.fromEntries(
      state.scores.map((p) => [p.playerId, resolvedWent[p.playerId] ? tricks[p.playerId] || 0 : 0]),
    ),
    ...extra,
  });

  // ---- barra de pontuações (sempre visível) ----
  const bar = (
    <div className="sd-bar">
      <div className="sd-bar-title">Pontuações · ganha quem chega a 0</div>
      <div className="sd-bar-row">
        {[...state.scores]
          .sort((a, b) => a.pts - b.pts)
          .map((p, i) => (
            <div
              key={p.playerId}
              className={`sd-chip ${i === 0 ? 'lead' : ''} ${p.pts <= 5 ? 'danger' : ''}`}
            >
              <div className="sd-chip-n">
                {p.name}
                {p.pts <= 5 ? ' ⚠' : ''}
              </div>
              <div className="sd-chip-v">{p.pts}</div>
            </div>
          ))}
      </div>
    </div>
  );

  const dots = (
    <div className="stepdot">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i <= step ? 'on' : ''} />
      ))}
    </div>
  );

  const suitLabel = () => {
    if (dark) return '♥ escuro';
    const s = SUITS.find((x) => x.k === suit);
    return s ? `${s.symbol} ${s.label}` : '';
  };
  const modeSummary = (
    <span className={`mult ${suit === 'copas' || dark ? 'copas' : ''}`}>
      {suitLabel()} ×{M}
    </span>
  );

  // ---------------- STEP 0: escolher/virar + trunfo ----------------
  if (step === 0) {
    const canContinue = mode && (dark || suit);
    return (
      <>
        {bar}
        {dots}
        <div className="eyebrow">Ronda {state.roundIndex + 1}</div>
        <div className="qlabel">{chooser.name} está a escolher</div>
        <div className="qhelp">Escolhe trunfo (arrisca mais) ou vira (arrisca menos).</div>

        <div className="grid2" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`chip ${mode === 'escolheu' ? 'on' : ''}`}
            onClick={() => {
              setMode('escolheu');
            }}
          >
            Escolher
          </button>
          <button
            type="button"
            className={`chip ${mode === 'virou' ? 'on' : ''}`}
            onClick={() => {
              setMode('virou');
              setDark(false);
            }}
          >
            Virar
          </button>
        </div>

        {mode && (
          <>
            <div className="qhelp">
              {dark
                ? 'Copas no escuro: pontuação a triplicar.'
                : mode === 'virou'
                  ? 'Que carta saiu ao virar?'
                  : 'Que trunfo escolheu?'}
            </div>
            {!dark &&
              SUITS.map((s) => (
                <button
                  key={s.k}
                  type="button"
                  className={`chip ${s.copas ? 'copas' : ''} ${suit === s.k ? 'on' : ''}`}
                  onClick={() => {
                    setSuit(s.k);
                    setDark(false);
                  }}
                >
                  {s.symbol} {s.label}
                  {s.note ? ` · ${s.note}` : ''}
                </button>
              ))}
            {mode === 'escolheu' && (
              <button
                type="button"
                className={`chip copas ${dark ? 'on' : ''}`}
                style={{ marginTop: 10 }}
                onClick={() => {
                  const nd = !dark;
                  setDark(nd);
                  if (nd) setSuit('copas');
                }}
              >
                ♥ Copas no escuro (×3)
              </button>
            )}
          </>
        )}

        <div className="mt" />
        <Button disabled={!canContinue} onClick={() => setStep(1)}>
          Continuar
        </Button>
      </>
    );
  }

  // ---------------- STEP 1: quem vai a jogo ----------------
  if (step === 1) {
    const alerts = [];
    const rows = state.scores.map((p) => {
      const forced = forcedReason(p, draft, state);
      if (forced) alerts.push({ name: p.name, reason: forced });
      const isChooser = p.playerId === chooserId;
      const w = resolvedWent[p.playerId];
      return (
        <div key={p.playerId} className={`jrow ${isChooser ? 'chooser' : ''}`}>
          <div style={{ flex: 1 }}>
            <div className="jname">
              {p.name}
              {isChooser ? ' 👑' : ''}
            </div>
            <div className="jpts">
              {p.pts} pts{p.passStreak > 0 ? ` · passou ${p.passStreak}×` : ''}
            </div>
          </div>
          {forced ? (
            <span className="lock">OBRIGADO A IR</span>
          ) : (
            <div className="seg">
              <button
                type="button"
                className={`go ${w === true ? 'on' : ''}`}
                onClick={() => setWent((x) => ({ ...x, [p.playerId]: true }))}
              >
                Vai
              </button>
              <button
                type="button"
                className={`pass ${w === false ? 'on' : ''}`}
                onClick={() => setWent((x) => ({ ...x, [p.playerId]: false }))}
              >
                Passa
              </button>
            </div>
          )}
        </div>
      );
    });
    const decided = state.scores.every((p) => resolvedWent[p.playerId] !== null);
    return (
      <>
        {bar}
        {dots}
        <div className="eyebrow">
          Ronda {state.roundIndex + 1} · {modeSummary}
        </div>
        <div className="qlabel">Quem vai a jogo?</div>
        <div className="qhelp">Os obrigados já vão marcados. Toca para os restantes.</div>
        {alerts.map((a, i) => (
          <div key={i} className="alert">
            <b>{a.name}</b> {a.reason}
          </div>
        ))}
        {rows}
        <div className="mt" />
        <Button disabled={!decided} onClick={() => setStep(2)}>
          Continuar
        </Button>
        <Button variant="ghost" onClick={() => setStep(0)}>
          Voltar
        </Button>
      </>
    );
  }

  // ---------------- STEP 2: vazas ----------------
  if (step === 2) {
    const goers = state.scores.filter((p) => resolvedWent[p.playerId] === true);
    const sum = goers.reduce((a, p) => a + (tricks[p.playerId] || 0), 0);
    const ok = sum === 5;

    const bump = (id, d) => {
      setTricks((t) => {
        const v = (t[id] || 0) + d;
        if (v < 0 || v > 5) return t;
        return { ...t, [id]: v };
      });
    };

    const register = () => {
      const provisional = buildRound();
      const deltas = computeDeltas(state, provisional);
      const zeros = state.scores.filter((p) => p.pts + deltas[p.playerId] <= 0);
      if (zeros.length >= 2 && !state.finished) {
        setStep(3); // precisa de desempate
      } else {
        onSubmit(provisional);
      }
    };

    return (
      <>
        {bar}
        {dots}
        <div className="eyebrow">
          Ronda {state.roundIndex + 1} · {modeSummary}
        </div>
        <div className="qlabel">Vazas de cada um</div>
        <div className="qhelp">Só quem foi a jogo. Total tem de dar 5.</div>
        {goers.map((p) => (
          <div key={p.playerId} className="vrow">
            <div className="vname">{p.name}</div>
            <button type="button" className="vstep" onClick={() => bump(p.playerId, -1)}>
              −
            </button>
            <div className="vval">{tricks[p.playerId] || 0}</div>
            <button type="button" className="vstep" onClick={() => bump(p.playerId, 1)}>
              +
            </button>
          </div>
        ))}
        <div className={`vsum ${ok ? '' : 'bad'}`}>Total: {sum} / 5</div>
        <div className="mt" />
        <Button disabled={!ok} onClick={register}>
          Registar ronda
        </Button>
        <Button variant="ghost" onClick={() => setStep(1)}>
          Voltar
        </Button>
      </>
    );
  }

  // ---------------- STEP 3: desempate (2+ chegaram a 0) ----------------
  const provisional = buildRound();
  const deltas = computeDeltas(state, provisional);
  const zeros = state.scores.filter((p) => p.pts + deltas[p.playerId] <= 0);
  return (
    <>
      {bar}
      <div className="eyebrow">Ronda {state.roundIndex + 1}</div>
      <div className="qlabel">Dois chegaram a 0!</div>
      <div className="qhelp">Quem fez a vaza que o levou a 0 primeiro? Esse ganha.</div>
      {zeros.map((p) => (
        <button
          key={p.playerId}
          type="button"
          className={`chip ${firstToZeroId === p.playerId ? 'on' : ''}`}
          onClick={() => setFirstToZeroId(p.playerId)}
        >
          {p.name}
        </button>
      ))}
      <div className="mt" />
      <Button disabled={!firstToZeroId} onClick={() => onSubmit(buildRound({ firstToZeroId }))}>
        Terminar jogo
      </Button>
      <Button variant="ghost" onClick={() => setStep(2)}>
        Voltar
      </Button>
    </>
  );
}
