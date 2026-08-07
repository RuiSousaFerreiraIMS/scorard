// Separador Perfil. Fase 0: identidade + instalar + estatísticas locais simples
// + teaser da conta (que fica real na Fase 1). Conteúdo real, não placeholder.

import { computeStats } from '../core/stats';
import { Eyebrow, Card } from '../ui/components.jsx';
import InstallBanner from '../ui/InstallBanner.jsx';
import AuthPanel from './AuthPanel.jsx';
import { useAuth } from '../core/useAuth';

export default function ProfileScreen({ history }) {
  const { user, ready, hasSupabase } = useAuth();
  const stats = computeStats(history);
  const total = stats.totalGames;

  return (
    <>
      <Eyebrow>O teu espaço</Eyebrow>
      <h1>Perfil</h1>
      <p className="sub">As tuas contas de jogo, num só sítio.</p>

      <InstallBanner />

      {hasSupabase ? (
        <>
          <Eyebrow style={{ marginBottom: 10 }}>Conta</Eyebrow>
          {ready ? <AuthPanel user={user} /> : <Card className="muted">A carregar…</Card>}
          <div className="mt-lg" />
        </>
      ) : null}

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-num">{total}</div>
          <div className="stat-label">{total === 1 ? 'jogo guardado' : 'jogos guardados'}</div>
        </div>
        <div className="stat">
          <div className="stat-num">{stats.players.length}</div>
          <div className="stat-label">jogadores</div>
        </div>
      </div>

      {total === 0 && (
        <div className="settle-none" style={{ marginTop: 4 }}>
          Ainda sem jogos guardados. Termina um jogo e as estatísticas aparecem aqui.
        </div>
      )}

      {stats.players.length > 0 && (
        <>
          <Eyebrow style={{ marginTop: 18, marginBottom: 10 }}>Ranking de sempre</Eyebrow>
          <div className="hint" style={{ marginBottom: 10 }}>
            Somando todos os jogos guardados.
          </div>
          {stats.players.map((p, i) => (
            <div key={p.name} className={`rankrow ${i === 0 ? 'top' : ''}`}>
              <span className={`rank ${i === 0 ? 'top' : ''}`}>{i === 0 ? '★' : i + 1}</span>
              <span className="rankname">
                {p.name}
                <span className="rankmeta">
                  {p.games} {p.games === 1 ? 'jogo' : 'jogos'} · {p.wins}{' '}
                  {p.wins === 1 ? 'vitória' : 'vitórias'}
                </span>
              </span>
              <span className={`rankmoney ${p.money > 0 ? 'pos' : p.money < 0 ? 'neg' : 'dim'}`}>
                {p.money > 0 ? '+' : ''}
                {p.money.toFixed(2)} €
              </span>
            </div>
          ))}
        </>
      )}

      {stats.byGame.length > 0 && (
        <>
          <Eyebrow style={{ marginTop: 18, marginBottom: 10 }}>Por jogo</Eyebrow>
          {stats.byGame.map((g) => (
            <div key={g.gameId} className="listrow">
              <span>{g.name}</span>
              <span className="muted">{g.count}</span>
            </div>
          ))}
        </>
      )}

      {!hasSupabase && (
        <>
          <div className="mt-lg" />
          <Card style={{ borderColor: 'var(--goldDim)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Conta Scorard — em breve</div>
            <div className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>
              Vais poder guardar os teus jogos na cloud, ver estatísticas ao longo do tempo,
              ter amigos e sessões ao vivo. Para já, tudo fica guardado neste telemóvel.
            </div>
          </Card>
        </>
      )}
    </>
  );
}
