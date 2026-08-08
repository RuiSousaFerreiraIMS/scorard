// Input de uma mão de Sueca: quem ganhou e com quantos pontos.
// Os pontos ajustam-se com botões grandes (à mesa ninguém quer teclado), e a app
// mostra logo quantos jogos aquilo vale — para não haver discussão.

import { useState } from 'react';
import { jogosFromPoints, TOTAL_POINTS } from './index.js';
import { Button, Eyebrow } from '../../ui/components.jsx';

export default function RoundInput({ game, state, onSubmit }) {
  const [winner, setWinner] = useState(null);
  const [points, setPoints] = useState(61);

  const jogos = jogosFromPoints(points);
  const isEmpate = points === 60;
  const capote = points >= TOTAL_POINTS;
  const canSubmit = winner !== null || isEmpate;

  const bump = (d) => setPoints((p) => Math.min(TOTAL_POINTS, Math.max(60, p + d)));

  const submit = () => {
    // no empate não interessa quem "ganhou"; guarda-se 0 por convenção
    onSubmit({ winnerTeam: isEmpate ? 0 : winner, points });
    setWinner(null);
    setPoints(61);
  };

  return (
    <>
      <div className="sd-bar">
        <div className="sd-bar-title">Jogos · primeira dupla a {state.gamesToWin} ganha</div>
        <div className="sd-bar-row">
          {state.teams.map((t) => (
            <div key={t.index} className="sd-chip lead" style={{ minWidth: 108 }}>
              <div className="sd-chip-n">{t.name}</div>
              <div className="sd-chip-v">{t.jogos}</div>
            </div>
          ))}
        </div>
      </div>

      <Eyebrow>Mão {state.roundIndex + 1}</Eyebrow>
      <div className="qlabel">Quem ganhou a mão?</div>
      <div className="qhelp">Toca na dupla. Se ficou 60–60, escolhe 60 nos pontos.</div>

      <div className="grid2" style={{ marginBottom: 18 }}>
        {state.teams.map((t) => (
          <button
            key={t.index}
            type="button"
            className={`chip ${winner === t.index ? 'on' : ''}`}
            onClick={() => setWinner(t.index)}
            disabled={isEmpate}
            style={isEmpate ? { opacity: 0.4 } : undefined}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="qlabel">Pontos das cartas</div>
      <div className="qhelp">Quantos pontos fez a dupla que ganhou (de 60 a 120).</div>

      <div className="pointsbox">
        <button type="button" className="vstep" onClick={() => bump(-10)}>
          −10
        </button>
        <button type="button" className="vstep" onClick={() => bump(-1)}>
          −
        </button>
        <div className="pointsval">{points}</div>
        <button type="button" className="vstep" onClick={() => bump(1)}>
          +
        </button>
        <button type="button" className="vstep" onClick={() => bump(10)}>
          +10
        </button>
      </div>

      <div className={`worth ${capote ? 'capote' : ''}`}>
        {isEmpate
          ? 'Empate 60–60 — não conta para ninguém'
          : capote
            ? 'CAPOTE! Vale 4 jogos'
            : `Vale ${jogos} ${jogos === 1 ? 'jogo' : 'jogos'}`}
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <button type="button" className="chip" onClick={() => setPoints(60)}>
          Empate 60–60
        </button>
        <button type="button" className="chip" onClick={() => setPoints(TOTAL_POINTS)}>
          Capote (120)
        </button>
      </div>

      <div className="mt" />
      <Button disabled={!canSubmit} onClick={submit}>
        Registar mão
      </Button>
    </>
  );
}
