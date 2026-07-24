# Scorard — Roteiro do produto e design da Fase 0

Evoluir a Scorard de "funciona" para uma app que as pessoas escolhem usar:
prática, profissional, agradável, mantendo a alma de jogos de cartas.

## Visão

Uma app mobile (PWA) de contagem de pontos para jogos de cartas onde:

- Marcar pontos é rápido, sem teclado a meio do jogo, números grandes e legíveis.
- Cada pessoa tem **conta**, com jogos favoritos, estatísticas e amigos.
- Uma sessão pode ser **partilhada ao vivo**: quem tem conta entra como jogador e
  pode editar o resultado; quem não tem, vê (e comenta).
- A identidade visual — mesa de jogo escura, dourado, naipes — mantém-se, elevada
  a nível de app profissional.

## Stack (tudo 0€)

- **Frontend:** o PWA atual (Vite + React) no GitHub Pages. Mantém-se estático e grátis.
- **Backend:** **Supabase** (free tier). Num só produto cobre:
  - **Auth** — email/password + OAuth Google (grátis).
  - **Postgres** — perfis, jogos, estatísticas, amigos (500 MB grátis).
  - **Realtime** — sessões ao vivo (200 ligações simultâneas, 2M msgs/mês grátis).
  - **Row Level Security** — permissões (quem edita o quê).
- Porquê Supabase e não Firebase: SQL encaixa melhor em relações (amigos, estatísticas),
  free tier generoso, auth+db+realtime num só sítio, open source.
- **Passo que só o Rui pode dar** (na Fase 1): criar o projeto Supabase e dar duas
  strings (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). A anon key é pública por
  design; a segurança faz-se por RLS. Sem `.env`, a app corre em modo local (fases 0).

## Fases (cada uma testável e publicável)

| Fase | Entrega | Backend |
|---|---|---|
| **0 · Casca da app** | Navegação de fundo, flow redesenhado, polimento pro, transições, estados vazios. | Não |
| **1 · Contas** | Registo/login, perfil, avatar, jogos favoritos. Migrar dados locais para a conta. | Auth |
| **2 · Estatísticas** | Jogos guardados na conta; estatísticas por jogo (vitórias, dinheiro, sequências). | DB |
| **3 · Amigos** | Adicionar amigos; metê-los num jogo com um toque no setup. Separador Amigos. | DB |
| **4 · Ao vivo** | Link ao vivo (substitui a "foto"); jogadores com conta entram e editam; espetadores veem; comentários. | Realtime |

Cada fase a partir da 1 leva a sua própria spec. Este documento fecha a Fase 0.

---

## Design da Fase 0 — Casca da app (sem backend)

Objetivo: a app passar a **sentir-se uma app**. Sem novas funcionalidades de dados;
é estrutura de navegação + redesenho + polimento.

### Arquitetura de navegação

Hoje `App.jsx` é uma máquina de estados de um só ecrã (`screen`). Passa a ter:

- **`AppShell`** — moldura permanente com **barra de navegação de fundo** (tab bar).
- **Separadores (tabs):** `Jogar`, `Histórico`, `Perfil`.
  - *Nota:* o `Amigos` só entra na Fase 3 (quando é real). Não se enviam separadores
    vazios "em breve" — o skeleton cresce quando cada peça existe.
- **Pilha de jogo:** o fluxo Setup → Jogo → Resultados é uma sobreposição por cima do
  separador `Jogar` (a tab bar esconde-se durante uma ronda para dar foco e espaço).
- A **vista partilhada** (`#s=...`) continua a fazer bypass da shell (é uma página à parte).

Estado: `tab` (jogar/historico/perfil) + o `screen` atual do fluxo de jogo. A tab bar
mostra-se em `home/historico/perfil`; esconde-se em `setup/game/results` e na vista partilhada.

### Sistema visual (tokens)

Manter a paleta (mesa escura + dourado) e **refinar**:

- **Tipografia:** escala clara (display / título / corpo / legenda / eyebrow). Dois pesos.
- **Espaçamento:** escala consistente (4/8/12/16/24/32) já existe — aplicar com rigor.
- **Raios e superfícies:** cartões 16px, controlos 12px; superfícies em 3 níveis (bg,
  surface, surfaceAlt) usadas com intenção (elevação = significado).
- **Naipes como motivo:** ♠♥♦♣ como identidade dos jogos (♥ copas em rosa `--copas`).
- **Componentes:** `AppShell`/`TabBar`, `Card`, `Button` (primary/ghost/danger),
  `Eyebrow`, `ListRow`, `EmptyState`, `Avatar` (iniciais, prepara a Fase 1).
- **Movimento:** transições subtis de ecrã (fade/slide curto, 150–200ms), respeitando
  `prefers-reduced-motion`.

### Ecrãs (o que muda)

- **Jogar (home):** cabeçalho com wordmark + avatar (iniciais, placeholder até à Fase 1);
  cartão "Continuar" destacado quando há sessão ativa; grelha de jogos com naipe, nome,
  nº de jogadores. Rodapé discreto.
- **Setup:** um passo limpo — jogadores (add/remove fluido) + opções; CTA fixo em baixo.
- **Jogo:** barra de pontuações sempre visível e legível; input da ronda com foco;
  desfazer/terminar acessíveis mas fora do caminho. (Fodinha e Sobe e Desce reusam a moldura.)
- **Resultados:** pódio claro, conta em euros legível, ações (partilhar, novo jogo).
- **Histórico:** lista de jogos com estado vazio convidativo; detalhe ronda-a-ronda.
- **Perfil:** identidade da app + instalar (move o `InstallBanner` para aqui e um resumo),
  estatísticas locais simples (jogos jogados, por jogo) e um teaser "Conta — em breve"
  que prepara a Fase 1. É conteúdo real, não um placeholder.

### Passos de implementação (checkpoints)

1. **0.1** Tokens refinados + `AppShell`/`TabBar` + troca de separadores (esqueleto a funcionar).
2. **0.2** Redesenho do separador Jogar.
3. **0.3** Polir Setup, Jogo e Resultados + transições.
4. **0.4** Separador Perfil (estatísticas locais + instalar + teaser conta) + estados vazios.
5. **0.5** Testes, build, verificação no browser dos fluxos completos, deploy.

### Não-objetivos da Fase 0

- Nada de contas, rede ou dados na cloud (fases seguintes).
- Não mudar a lógica de pontuação dos jogos (já testada).
- Não redesenhar a vista partilhada além do alinhamento visual com os novos tokens.

### Critérios de conclusão

- Navegação de fundo funcional; fluxo de jogo completo (Fodinha e Sobe e Desce) sem regressões.
- 33 testes existentes continuam verdes; build limpo; sem erros de consola.
- Aspeto claramente "app" (o mockup aprovado a 2026-07-24 como referência de direção).
