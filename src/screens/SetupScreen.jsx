// Setup do jogo: escolher quem joga (da lista de conhecidos, ou escrevendo um
// nome novo) e as opções da partida.
//
// A lista poupa escrita à mesa e mantém os nomes consistentes — é o mesmo nome
// de sempre, não uma variação. Quem tem conta Scorard entra com o `userId`, e é
// por isso que depois pode ajudar a marcar numa sessão ao vivo.

import { useState, useEffect, useMemo } from 'react';
import { getGame } from '../core/gameRegistry';
import { loadFriends } from '../core/friends';
import { buildRoster } from '../core/roster';
import { normalizeName } from '../core/stats';
import { Eyebrow, Card, Button, BackButton, playersLabel } from '../ui/components.jsx';
import { Icon } from '../ui/icons.jsx';

let idCounter = 0;
const newPlayer = (name = '', userId = null) => ({
  id: `p${Date.now()}_${idCounter++}`,
  name,
  ...(userId ? { userId } : {}),
});

export default function SetupScreen({ gameId, initialPlayers, onStart, onBack, user, history = [] }) {
  const game = getGame(gameId);
  const [friends, setFriends] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!user) return;
    loadFriends(user.id).then((d) => d && setFriends(d.friends));
  }, [user?.id]);

  const [players, setPlayers] = useState(() => {
    if (initialPlayers && initialPlayers.length >= game.minPlayers) {
      return initialPlayers.map((p) => newPlayer(p.name, p.userId));
    }
    return [];
  });

  const [setup, setSetup] = useState(() => {
    const init = {};
    game.setupFields.forEach((f) => {
      init[f.key] = String(f.default);
    });
    return init;
  });

  const roster = useMemo(() => buildRoster(history, friends), [history, friends]);
  const chosen = new Set(players.map((p) => normalizeName(p.name)));
  const available = roster.filter((r) => !chosen.has(r.key));

  const full = players.length >= game.maxPlayers;
  const canStart = players.length >= game.minPlayers && players.every((p) => p.name.trim());

  const addFromRoster = (r) => {
    if (full) return;
    setPlayers((ps) => [...ps, newPlayer(r.name, r.userId)]);
  };

  const addTyped = () => {
    const name = newName.trim();
    if (!name || full) return;
    if (chosen.has(normalizeName(name))) {
      setNewName('');
      return; // já está no jogo
    }
    // se o nome já existe na lista, aproveita o userId dessa pessoa
    const known = roster.find((r) => r.key === normalizeName(name));
    setPlayers((ps) => [...ps, newPlayer(known ? known.name : name, known?.userId)]);
    setNewName('');
    setAdding(false);
  };

  const removePlayer = (id) => setPlayers((ps) => ps.filter((p) => p.id !== id));

  const start = () => {
    const parsed = {};
    game.setupFields.forEach((f) => {
      parsed[f.key] = f.type === 'number' ? Number(setup[f.key]) : setup[f.key];
    });
    onStart(players, parsed);
  };

  return (
    <>
      <BackButton onClick={onBack} />
      <Eyebrow>Configurar</Eyebrow>
      <h1 style={{ margin: '4px 0 2px' }}>{game.name}</h1>
      <p className="sub">
        {playersLabel(game)} · escolhe quem joga
      </p>

      <Eyebrow style={{ marginBottom: 10 }}>
        A jogar ({players.length}
        {game.minPlayers === game.maxPlayers ? `/${game.maxPlayers}` : ''})
      </Eyebrow>

      {players.length === 0 && (
        <div className="settle-none" style={{ marginBottom: 10 }}>
          Ainda ninguém. Escolhe da lista abaixo ou adiciona um jogador novo.
        </div>
      )}

      {players.map((p, i) => (
        <div key={p.id} className="prow">
          <div className="pnum">{i + 1}</div>
          <div className="pchosen">
            {p.name}
            {p.userId && (
              <span className="pchosen-tag" title="Tem conta Scorard — pode ajudar a marcar">
                conta
              </span>
            )}
          </div>
          <button
            type="button"
            className="premove"
            onClick={() => removePlayer(p.id)}
            aria-label={`Tirar ${p.name}`}
          >
            ×
          </button>
        </div>
      ))}

      {!full && (
        <>
          {available.length > 0 && (
            <>
              <Eyebrow style={{ marginTop: 16, marginBottom: 8 }}>Jogadores</Eyebrow>
              <div className="rosterwrap">
                {available.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    className={`friendchip ${r.userId ? 'hasaccount' : ''}`}
                    onClick={() => addFromRoster(r)}
                  >
                    + {r.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {adding ? (
            <div className="prow" style={{ marginTop: 10 }}>
              <input
                className="pinput"
                autoFocus
                placeholder="Nome do jogador"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTyped()}
              />
              <button type="button" className="friendbtn" onClick={addTyped}>
                Juntar
              </button>
            </div>
          ) : (
            <button type="button" className="addrow" onClick={() => setAdding(true)}>
              <Icon name="plus" size={15} /> Adicionar jogador novo
            </button>
          )}
        </>
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
        {canStart
          ? 'Começar jogo'
          : `Faltam ${game.minPlayers - players.length} jogador${game.minPlayers - players.length > 1 ? 'es' : ''}`}
      </Button>
    </>
  );
}
