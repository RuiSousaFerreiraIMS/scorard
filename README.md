# CardScore

App de contagem de pontos para jogos de cartas. As contas de dinheiro e pontos
fazem-se sozinhas. É uma **PWA** (web app instalável): funciona em Android e iPhone,
"adicionar ao ecrã inicial" e fica com ícone como uma app. Offline depois da 1ª visita.
0€ de custos — hosting grátis no GitHub Pages.

Primeiro jogo pronto: **Fodinha**. A seguir: **Sobe e Desce**
(spec pronta em `docs/sobe-e-desce-spec.md`).

## Estado do projeto

- **Base PWA** — Vite + React, instalável e offline.
- **Fodinha** — implementada, contas de dinheiro validadas por testes.
- **Histórico** — jogos terminados guardados localmente (comum a todos os jogos),
  com detalhe ronda-a-ronda.
- **Desfazer** — anula a última ronda a qualquer momento.
- **Partilhar resultado** — texto das contas finais para o WhatsApp & afins.
- **Sobe e Desce** — spec de pontuação completa em `docs/sobe-e-desce-spec.md`.
  Falta implementar o módulo (é o próximo jogo).

## Como correr localmente

Precisas de Node.js 20+.

```bash
npm install
npm run dev      # abre em http://localhost:5173/scorard/
npm test         # testes da lógica (vitest)
npm run build    # build de produção para dist/
npm run preview  # serve o build (para testar a PWA/offline)
```

## Como publicar (GitHub Pages, grátis)

Há um workflow em `.github/workflows/deploy.yml` que faz build e publica a cada push
para `main`. Para ativar (uma vez só):

1. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. `git push` para `main`.

A app fica em `https://<user>.github.io/scorard/`. O caminho `/scorard/` está
configurado em `vite.config.js` (`base`). Se mudares o nome do repo, muda o `base`.

## Ícones

Os ícones da PWA são gerados a partir de `scripts/icon.svg`:

```bash
npm run icons    # regenera public/icons/ com o sharp
```

## Arquitetura

O que muda de jogo para jogo são **só as regras de pontuação**. Tudo o resto —
histórico, sessões, setup, ecrãs, partilha — é comum a todos.

```
index.html · vite.config.js       config + PWA (manifest + service worker)
src/
  main.jsx · App.jsx              arranque + máquina de estados de ecrãs
  core/
    gameRegistry.js               liga os jogos à app (o "contrato" a cumprir)
    session.js                    sessão = registo de eventos (ver abaixo)
    storage.js                    localStorage: sessão ativa + histórico
    share.js                      partilhar resultado (Web Share API)
    format.js                     euro, datas
  games/
    fodinha/
      index.js                    regras + contas da Fodinha
      RoundInput.jsx              input de ronda específico da Fodinha
      *.test.js                   testes da lógica
  screens/                        Home, Setup, Game, Results, History
  ui/
    styles.css                    tema (mesa de jogo nocturna)
    components.jsx                Button, Card, Eyebrow, …
scripts/                          geração de ícones
docs/
  sobe-e-desce-spec.md            spec de pontuação do Sobe e Desce (fonte de verdade)
  superpowers/specs/              design docs
mockups/                          demos HTML originais (referência de design)
```

### Sessão como registo de eventos

Uma sessão guarda os **inputs** de cada ronda, não o estado calculado. O estado
visível é sempre derivado:

```js
state = rounds.reduce((s, input) => game.applyRound(s, input),
                      game.createState(players, setup))
```

Daqui saem, de graça: **desfazer** (tirar a última ronda), **histórico ronda-a-ronda**
(dobrar os rounds um a um) e, no futuro, **partilha de sessão ao vivo** (sincronizar
a lista de rounds).

## Como adicionar um jogo novo

Cada jogo é uma pasta em `src/games/<jogo>/` que cumpre a interface descrita no topo
de `src/core/gameRegistry.js` (`createState`, `applyRound`, `getStandings`, …) e traz
o seu próprio componente `RoundInput`. Depois regista-se no array `GAMES`. **Os ecrãs
não mudam** — são moldura genérica.

## Roadmap

1. ~~Converter a base para PWA + migrar a Fodinha.~~ ✅
2. Implementar o Sobe e Desce a partir da spec.
3. Partilha de sessão ao vivo (link só-de-ver + comentários) — precisa de servidor,
   spec própria.
4. Áudio da pontuação e jogos seguintes (Sueca, Hearts, …).
