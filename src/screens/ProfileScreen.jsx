// Separador Perfil. Fase 0: identidade + instalar + estatísticas locais simples
// + teaser da conta (que fica real na Fase 1). Conteúdo real, não placeholder.

import { getGame } from '../core/gameRegistry';
import { Eyebrow, Card } from '../ui/components.jsx';
import InstallBanner from '../ui/InstallBanner.jsx';

export default function ProfileScreen({ history }) {
  const total = history.length;

  // contagem por jogo (estatística local simples)
  const byGame = {};
  for (const s of history) {
    byGame[s.gameId] = (byGame[s.gameId] || 0) + 1;
  }
  const perGame = Object.entries(byGame).map(([id, n]) => ({
    name: getGame(id)?.name || id,
    n,
  }));

  return (
    <>
      <Eyebrow>O teu espaço</Eyebrow>
      <h1>Perfil</h1>
      <p className="sub">As tuas contas de jogo, num só sítio.</p>

      <InstallBanner />

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-num">{total}</div>
          <div className="stat-label">jogos guardados</div>
        </div>
        <div className="stat">
          <div className="stat-num">{perGame.length}</div>
          <div className="stat-label">jogos diferentes</div>
        </div>
      </div>

      {perGame.length > 0 && (
        <>
          <Eyebrow style={{ marginTop: 8, marginBottom: 10 }}>Por jogo</Eyebrow>
          {perGame.map((g) => (
            <div key={g.name} className="listrow">
              <span>{g.name}</span>
              <span className="muted">{g.n}</span>
            </div>
          ))}
        </>
      )}

      <div className="mt-lg" />
      <Card style={{ borderColor: 'var(--goldDim)' }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Conta Scorard — em breve</div>
        <div className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>
          Vais poder guardar os teus jogos na cloud, ver estatísticas ao longo do tempo,
          ter amigos e sessões ao vivo. Para já, tudo fica guardado neste telemóvel.
        </div>
      </Card>
    </>
  );
}
