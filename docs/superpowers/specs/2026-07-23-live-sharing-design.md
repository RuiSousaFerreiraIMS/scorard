# Partilha de sessão — Design

Como deixar amigos **acompanhar o score** de um jogo através de um link, e (mais
tarde) **comentar** sem poderem alterar resultados. Objetivo: 0€ e promover a app.

## O problema de base

Hoje a Scorard é 100% offline: o estado vive no telemóvel de quem marca. Partilhar
implica levar esse estado a outro dispositivo. Há dois níveis, com custos muito
diferentes:

- **Instantâneo (snapshot):** um link que contém o estado atual. Quem abre vê o que
  havia no momento em que o link foi gerado/atualizado. **Não precisa de servidor.**
- **Ao vivo (sync) + comentários:** o marcador empurra cada ronda para um sítio
  central e os espectadores recebem em tempo real; comentários voltam por lá.
  **Precisa de um relay/servidor.**

Esta spec entrega o snapshot **já** (Fase A) e desenha o ao-vivo (Fase B) para ser
decidido e ligado depois.

## Fase A — Link read-only (sem backend) ✅ implementar já

- Botão **"Partilhar sessão"** no jogo e nos resultados.
- Gera `https://…/scorard/#s=<sessão-codificada>` (os rounds + jogadores + setup,
  em base64url no fragmento `#`, que nunca vai para servidor nenhum).
- Quem abre o link vê uma **vista só-de-leitura**: classificação atual e ronda-a-ronda,
  derivadas do mesmo motor do jogo. Não escreve no storage do visitante.
- **Chamada à ação**: botão "Abrir a Scorard" → promove a app a quem está a ver.
- Limitações honestas: é uma foto do momento; para atualizar, o marcador volta a
  partilhar. Sem comentários (Fase B).
- Privacidade: os dados (nomes, pontos) estão no link que o **próprio utilizador**
  escolhe enviar. Não passam por terceiros. O fragmento `#` não é enviado em pedidos
  HTTP nem fica em logs de servidor.

## Fase B — Ao vivo + comentários (precisa de backend)

Modelo: cada sessão tem um `id` aleatório. O marcador publica os eventos (a lista de
rounds — encaixa no event sourcing que já temos); espectadores subscrevem e derivam
o estado. Comentários são uma segunda coleção append-only por sessão.

### Opções de backend (todas com free tier)

| Opção | Signup? | Prós | Contras |
|-------|:-------:|------|---------|
| **Supabase** (Postgres + Realtime) | sim (1 projeto) | grátis generoso, realtime e DB juntos, fácil | é preciso criar projeto + colar URL/anon key |
| **Firebase** (Firestore/RTDB) | sim | realtime maduro, SDK simples | vendor Google, regras de segurança a afinar |
| **Cloudflare** (Workers + Durable Objects/KV) | sim | muito barato/grátis, WebSocket nativo | mais código de servidor a escrever |
| **Broker MQTT/WebSocket público** (ex: HiveMQ público) | **não** | zero setup, zero conta | inseguro (qualquer um com o id lê/escreve), sem persistência garantida |

**Recomendação:** **Supabase**. Free tier chega de sobra para um grupo de amigos,
dá realtime + persistência (histórico partilhável) e moderação de comentários com
Row Level Security. O único passo que exige o Rui: criar o projeto e colar duas
strings (URL + anon key) num `.env` — a app lê daí. Sem isso, a Fase B fica inerte
mas não parte nada (degrada para a Fase A).

> O broker público parece tentador (0 conta) mas mandava nomes/scores para um serviço
> público que qualquer pessoa pode ler — não o recomendo nem para um jogo de cartas.

### Segurança / moderação (Fase B)
- Marcador tem um "token de dono" (guardado local) que autoriza escrever rounds.
- Espectadores: só leem rounds; podem escrever **comentários** (append-only), com
  nome livre. Sem editar/apagar rounds.
- `id` de sessão longo e aleatório (não adivinhável). Opção de "fechar" a sessão.

### Passos de implementação (Fase B, quando houver backend)
1. `core/sync/` com uma interface `SessionSync` (publishRound, subscribe, postComment,
   subscribeComments). Implementação `SupabaseSync` + `NullSync` (fallback Fase A).
2. Config por `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. Ecrã de espectador ao vivo (reusa a vista da Fase A + comentários).
4. Botão "Partilhar ao vivo" quando o backend está configurado.

## Arquitetura partilhada (A e B)

Ambas as fases assentam no que já existe: a sessão é uma lista de eventos (rounds).
Partilhar = transportar essa lista. A vista do espectador usa `deriveState` /
`deriveStepStates` — **zero lógica de jogo nova**. Trocar snapshot↔ao-vivo é trocar
a *fonte* da lista de rounds, não a app.

## Critérios de conclusão

- **Fase A:** link gerável, abre vista read-only correta noutro dispositivo, com CTA;
  não toca no storage do visitante; testes de codificação/descodificação verdes.
- **Fase B:** com `.env` configurado, dois dispositivos veem a mesma sessão a atualizar
  e comentários aparecem; sem `.env`, tudo degrada para a Fase A sem erros.
