# CardScore

App de contagem de pontos para jogos de cartas. As contas de dinheiro e pontos
fazem-se sozinhas. Primeiro jogo pronto: **Fodinha**. A seguir: **Sobe e Desce**
(spec pronta em `docs/`).

## Estado do projeto

- **Fodinha** — implementada (React Native / Expo), lógica de dinheiro validada.
- **Sobe e Desce** — spec de pontuação completa e testada em `docs/sobe-e-desce-spec.md`.
  Falta implementar o módulo.
- **Mockups** — demos HTML jogáveis no browser em `mockups/` (para mostrar a amigos).

## Próximo passo: converter para PWA

O plano é lançar como **web app (PWA)** — 0 budget, funciona em Android e iPhone,
"adicionar ao ecrã inicial" e fica com ícone como uma app. Hosting grátis
(Netlify / Cloudflare Pages / GitHub Pages). Isto substitui a necessidade de
publicar nas lojas (sem 25€ Google nem 99€/ano Apple).

A base atual está em Expo (React Native). Os mockups em `mockups/` já são web
puro e servem de base para a PWA.

## Estrutura

```
App.js                    navegação + persistência (versão Expo)
src/core/
  gameRegistry.js         liga os jogos à app (o "contrato" a cumprir)
  storage.js              guardar/retomar jogo
  theme.js                cores e espaçamentos
src/games/
  fodinha.js              regras + contas da Fodinha
src/screens/              Home, Setup, Game, Results
src/components/ui.js      botões e cartões reutilizáveis
docs/
  sobe-e-desce-spec.md    spec de pontuação do Sobe e Desce (fonte de verdade)
mockups/
  fodinha-demo.html       demo jogável da Fodinha
  sobeedesce-demo.html    demo jogável do Sobe e Desce (com barra de pontuações)
```

## Como correr a versão Expo (para testar já)

Precisas de Node.js 18+ (idealmente 20+) e do Expo Go no telemóvel.

```bash
npm install
npx expo start
```

Lê o QR code com o Expo Go (Android) ou a câmara (iPhone). Telemóvel e PC na
mesma rede Wi-Fi. Se a rede der problemas: `npx expo start --tunnel`.

## Como abrir os mockups

Abre os ficheiros em `mockups/` em qualquer browser (telemóvel ou PC). Não
precisam de instalação. São demos: não guardam o jogo ao fechar.

## Como adicionar um jogo novo

Cada jogo é **um único ficheiro** em `src/games/` que cumpre a interface
descrita no topo de `src/core/gameRegistry.js`. Depois regista-se lá no array
`GAMES`. Os ecrãs funcionam para qualquer jogo que cumpra o contrato.

Jogos com input mais rico (como o Sobe e Desce: quem pediu, trunfo, vazas por
jogador) precisam de um ecrã de ronda próprio — ver o mockup como referência.

## Ideias já pensadas para o Sobe e Desce

- Input todo clicável (nada de teclado a meio do jogo).
- Alertas automáticos de obrigatoriedade (paus, quem escolhe, passar 2× seguidas,
  pontos ≤ 5).
- Barra de pontuações fixa durante a ronda (já no mockup).
- Anúncio da pontuação por áudio (Web Speech API do browser, grátis) — fase 2.

## Roadmap sugerido

1. Converter a base para PWA.
2. Migrar a Fodinha e publicar uma primeira versão (link partilhável).
3. Implementar o Sobe e Desce a partir da spec.
4. Áudio da pontuação e jogos seguintes (Sueca, Hearts, ...).
