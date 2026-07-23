import { useState } from 'react';
import { getGame } from '../core/gameRegistry';
import { Eyebrow, Card, Button, BackButton } from '../ui/components.jsx';

let idCounter = 0;
const newPlayer = (name = '') => ({ id: `p${Date.now()}_${idCounter++}`, name });

export default function SetupScreen({ gameId, initialPlayers, onStart, onBack }) {
  const game = getGame(gameId);

  const [players, setPlayers] = useState(() => {
    if (initialPlayers && initialPlayers.length >= game.minPlayers) {
      return initialPlayers.map((p) => newPlayer(p.name));
    }
    const count = Math.max(game.minPlayers, 2);
    return Array.from({ length: count }, () => newPlayer(''));
  });

  const [setup, setSetup] = useState(() => {
    const init = {};
    game.setupFields.forEach((f) => {
      init[f.key] = String(f.default);
    });
    return init;
  });

  const updatePlayer = (id, name) =>
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)));
  const addPlayer = () => {
    if (players.length < game.maxPlayers) setPlayers((ps) => [...ps, newPlayer('')]);
  };
  const removePlayer = (id) => {
    if (players.length > game.minPlayers) setPlayers((ps) => ps.filter((p) => p.id !== id));
  };

  const canStart = players.length >= game.minPlayers;

  const start = () => {
    const named = players.map((p, i) => ({ ...p, name: p.name.trim() || `Jogador ${i + 1}` }));
    const parsed = {};
    game.setupFields.forEach((f) => {
      parsed[f.key] = f.type === 'number' ? Number(setup[f.key]) : setup[f.key];
    });
    onStart(named, parsed);
  };

  return (
    <>
      <BackButton onClick={onBack} children="‹ Voltar" />
      <Eyebrow>Configurar</Eyebrow>
      <h2>{game.name}</h2>

      <div className="mt-lg" />
      <Eyebrow style={{ marginBottom: 10 }}>Jogadores ({players.length})</Eyebrow>
      {players.map((p, i) => (
        <div key={p.id} className="prow">
          <div className="pnum">{i + 1}</div>
          <input
            className="pinput"
            value={p.name}
            onChange={(e) => updatePlayer(p.id, e.target.value)}
            placeholder={`Jogador ${i + 1}`}
          />
          {players.length > game.minPlayers && (
            <button type="button" className="premove" onClick={() => removePlayer(p.id)}>
              ×
            </button>
          )}
        </div>
      ))}
      {players.length < game.maxPlayers && (
        <button type="button" className="addrow" onClick={addPlayer}>
          + Adicionar jogador
        </button>
      )}

      {game.setupFields.length > 0 && (
        <>
          <div className="mt-lg" />
          <Eyebrow style={{ marginBottom: 10 }}>Opções</Eyebrow>
          {game.setupFields.map((f) => (
            <Card key={f.key} className="optcard">
              <span className="optlabel">{f.label}</span>
              <input
                className="optinput"
                inputMode="decimal"
                value={setup[f.key]}
                onChange={(e) => setSetup((s) => ({ ...s, [f.key]: e.target.value }))}
              />
            </Card>
          ))}
        </>
      )}

      <div className="mt-xl" />
      <Button onClick={start} disabled={!canStart}>
        Começar jogo
      </Button>
    </>
  );
}
