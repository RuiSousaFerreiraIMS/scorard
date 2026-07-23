# CardScore PWA — Design (v1)

Fonte de verdade para a migração da base para PWA e da Fodinha. Escrito para ser
inequívoco: a implementação segue isto.

## 1. Objetivo

Uma web app (PWA) instalável e offline onde a malta aponta pontuações de jogos de
cartas de forma prática. Plataforma pronta para **ir juntando jogos**: o que muda
de jogo para jogo são só as regras de pontuação; o resto — histórico, sessões,
setup, ecrãs, e futura partilha — é comum a todos.

Restrições: **0€**. Hosting estático grátis (GitHub Pages, repo `scorard`).

### v1 (esta spec)
- Base PWA: instalável ("adicionar ao ecrã inicial"), funciona offline.
- Fodinha migrada da versão Expo, com a lógica de dinheiro intacta.
- Sessão como **registo de eventos** (ver §3).
- Desfazer a última ronda.
- Histórico de jogos terminados, **comum a todos os jogos**, guardado localmente.
- Publicada no GitHub Pages com link partilhável.

### Fora de âmbito (specs próprias, depois)
- Sobe e Desce (spec já pronta em `docs/sobe-e-desce-spec.md`) — jogo seguinte.
- Partilha de sessão ao vivo + comentários — segundo sistema (precisa de servidor).
- Áudio da pontuação, mais jogos.

## 2. Stack e estrutura

- **Vite + React** (DOM, não React Native). Bundle pequeno (~60 KB gzip alvo).
- **vite-plugin-pwa** gera service worker (precache offline) e injeta o manifest.
- **vitest** para a lógica de pontuação (JS puro, testável sem browser).
- Sem router em v1 (máquina de estados de ecrãs, como a versão Expo). Router entra
  quando a partilha ao vivo precisar de URLs.
- `base: '/scorard/'` no Vite (GitHub Pages serve em `/scorard/`).

```
index.html
vite.config.js
src/
  main.jsx                arranque React
  App.jsx                 máquina de estados de ecrãs + persistência
  core/
    gameRegistry.js       liga jogos à app (contrato §4)
    session.js            criar/derivar/mutar sessões (event sourcing)
    storage.js            localStorage: sessão ativa + histórico
    format.js             euro, datas
  games/
    fodinha/
      index.js            regras + contas (portado de src/games/fodinha.js)
      RoundInput.jsx      UI de input da ronda da Fodinha
      fodinha.test.js     testes da lógica
  screens/
    HomeScreen.jsx        escolher jogo · retomar · histórico
    SetupScreen.jsx       jogadores + opções do jogo
    GameScreen.jsx        moldura da ronda (cabeçalho, standings, desfazer, terminar)
    ResultsScreen.jsx     contas finais
    HistoryScreen.jsx     lista de jogos terminados + detalhe ronda-a-ronda
  ui/
    styles.css            tema (CSS vars dos mockups) + classes
    components.jsx        Button, Card, Eyebrow, Screen
public/
  icons/                  ícones PWA (192/512/maskable/apple-touch)
  favicon.svg
```

Ficheiros Expo removidos (ficam no histórico git, commit `090cf73`): `App.js`,
`app.json`, `src/screens/*.js` (RN), `src/components/ui.js` (RN),
`src/core/theme.js` (RN), `src/core/storage.js` (AsyncStorage). A **lógica**
`src/games/fodinha.js` e `src/core/gameRegistry.js` é reaproveitada (adaptada).

## 3. Sessão como registo de eventos (decisão central)

Uma sessão guarda os **inputs** de cada ronda, não o estado calculado:

```js
{
  id,            // uuid curto
  gameId,        // 'fodinha'
  players,       // [{id, name}]
  setup,         // opções (ex: {baseValue, increment})
  rounds,        // [input, input, ...]  ← os eventos
  startedAt,     // ISO
  finishedAt,    // ISO | null
}
```

O estado visível é **sempre derivado**, nunca guardado:

```js
state = rounds.reduce((s, input) => game.applyRound(s, input),
                      game.createState(players, setup))
```

Condição: `applyRound` puro e determinístico (a Fodinha já é).

Daqui saem os três pedidos com uma só decisão:
- **Desfazer** = `rounds.slice(0, -1)` e recalcular.
- **Histórico ronda-a-ronda** (comum a todos) = dobrar `rounds` um a um e pedir os
  standings ao jogo em cada passo. Serve já a Fodinha e servirá o Sobe e Desce sem
  código novo no histórico.
- **Partilha ao vivo** (futuro) = sincronizar `rounds` entre dispositivos, sem
  reescrever a app.

Consequência: a Fodinha deixa de guardar `history[]` dentro do estado — passa a ser
derivado. Sem dados duplicados.

## 4. Contrato de jogo (o que muda por jogo = só a pontuação)

```js
// src/games/<jogo>/index.js
export default {
  id, name, description, minPlayers, maxPlayers,
  setupFields,                 // [{key,label,type,default}] para o SetupScreen
  createState(players, setup), // estado inicial (puro)
  applyRound(state, input),    // reducer puro: (state, input) -> state
  getRoundConfig(state),       // {label, helper?} cabeçalho da ronda atual
  getStandings(state),         // [{playerId,name,score,scoreLabel}] ordenado
  isFinished(state),           // bool (fim automático; Fodinha: sempre false)
  roundSummary(input, index, players), // string curta p/ histórico (comum)
  RoundInput,                  // componente React: recolhe o input da ronda
}
```

`RoundInput` recebe `{ game, state, players, onSubmit }` e chama
`onSubmit(input)`. Tudo o que é específico do jogo (marcar perdedores na Fodinha;
mais tarde: trunfo/vazas no Sobe e Desce) vive aqui. **Os ecrãs não mudam para
adicionar um jogo** — só se cria a pasta do jogo e uma linha no registry.

Isto corrige o defeito atual: o `GameScreen` da versão Expo tem o input da Fodinha
escrito à mão apesar de o registry prometer `inputComponentKey`. Passa a moldura.

## 5. Ecrãs

- **Home** — lista de jogos (do registry), botão "retomar" se houver sessão ativa,
  entrada para o Histórico.
- **Setup** — nomes de jogadores (add/remove, respeita min/max) + `setupFields`.
- **Game** (moldura) — cabeçalho da ronda (`getRoundConfig`), standings
  (`getStandings`), `<game.RoundInput>`, **Desfazer última ronda**, histórico da
  sessão atual, **Terminar jogo**.
- **Results** — contas finais (`getStandings`), guardar no histórico, novo jogo/menu.
- **History** — lista de sessões terminadas (comum a todos os jogos): jogo, data,
  jogadores, vencedor. Detalhe: standings finais + ronda-a-ronda derivado.

## 6. Persistência (localStorage)

- `cardscore:active` — a sessão ativa (objeto §3). Escrita a cada ronda/undo.
- `cardscore:history` — array de sessões terminadas (mais recente primeiro).
- Ao terminar: mover a ativa para o histórico, limpar a ativa.
- Erros de storage (quota, modo privado) são engolidos sem rebentar a app; o pior
  caso é não persistir, não é crashar.

## 7. PWA

- `manifest.webmanifest`: nome "CardScore", `display: standalone`, tema `#0F1714`,
  ícones 192/512 + maskable, `start_url`/`scope` = `/scorard/`.
- Service worker (vite-plugin-pwa, `registerType: autoUpdate`): precache do app
  shell → abre offline. Prompt de atualização silencioso (autoUpdate).
- Ícone: marca dourada sobre verde-feltro (tema), gerada em SVG e rasterizada.

## 8. Testes

- `fodinha.test.js` (vitest): valida as contas de dinheiro contra cenários
  conhecidos (ronda normal, ronda perfeita faz subir o valor, várias rondas
  seguidas, divisão do pote por vários vencedores). A lógica portada tem de dar os
  mesmos resultados da versão Expo.
- `session.test.js`: derivar estado de uma lista de rounds; desfazer remove a
  última ronda e recalcula; sessão vazia = estado inicial.

## 9. Critérios de conclusão

- `npm run build` produz `dist/` estático.
- `npm test` verde.
- App abre offline depois da 1ª visita; instalável no telemóvel.
- Fodinha jogável ponta a ponta: setup → rondas → desfazer → terminar → histórico.
- Deploy no GitHub Pages a partir de `dist/` (workflow ou branch), link partilhável.
