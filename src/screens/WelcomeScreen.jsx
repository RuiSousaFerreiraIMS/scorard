// Primeiro ecrã de quem abre a app pela primeira vez (ou saiu da conta).
// Apresenta a Scorard e leva a criar conta / entrar. Dá para continuar sem conta
// — quem quiser experimentar primeiro não fica bloqueado.

import AuthPanel from './AuthPanel.jsx';

export default function WelcomeScreen({ onSkip }) {
  return (
    <div className="welcome">
      <div className="welcome-hero">
        <div className="welcome-suits">
          <span>♠</span>
          <span className="copas">♥</span>
          <span>♦</span>
          <span className="copas">♣</span>
        </div>
        <h1 className="welcome-title">Scorard</h1>
        <p className="welcome-pitch">
          As contas dos jogos de cartas, feitas sozinhas.
          <br />
          Cria conta para guardares os teus jogos, favoritos e estatísticas.
        </p>
      </div>

      <AuthPanel user={null} defaultMode="signup" />

      <button type="button" className="btn btn-ghost" onClick={onSkip}>
        Continuar sem conta
      </button>
      <p className="welcome-note">
        Sem conta funciona à mesma — mas os jogos ficam só neste telemóvel.
      </p>
    </div>
  );
}
