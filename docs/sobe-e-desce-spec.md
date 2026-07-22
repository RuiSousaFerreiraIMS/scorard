# Sobe e Desce — Especificação de Pontuação

Fonte de verdade para implementar o módulo `sobeedesce` na app CardScore.
Escrito para ser inequívoco: quando implementarmos, a lógica segue isto à letra.

## 1. Visão geral

- Jogo de vazas ao estilo sueca, 4 ou 5 jogadores.
- Todos começam com **20 pontos**. Objetivo: chegar a **0** (ou abaixo).
- Cada ronda, um jogador é o "a escolher o trunfo" (roda a cada ronda).
- Cada vaza feita tira pontos; não fazer vazas (falhar) dá penalização.
- Multiplicador da ronda depende do trunfo/modo.
- No fim, os pontos restantes de cada perdedor convertem-se em dinheiro.

## 2. Distribuição e escolha do trunfo

Ordem por ronda (exemplo com 4 jogadores; o jogador à direita do que escolhe é
quem dá as cartas):

1. Quem dá distribui **3 cartas** a cada jogador.
2. Pergunta ao jogador "a escolher o trunfo": queres escolher trunfo?
   - **Escolhe (pede):** o jogador define o trunfo. Modo = `escolheu`.
   - **Vira:** recusa; o trunfo é a 4ª carta que ele ia receber, virada e visível
     a todos. Modo = `virou`. (Ele recebe essa carta na mão na mesma.)
3. Quem dá distribui mais 2 cartas a cada um, até todos terem **5 cartas**.
4. Fase de troca: quem vai a jogo pode trocar cartas que não quer pelas do baralho
   por dar. (Detalhe de jogo, não afeta pontuação.)
   - 4 jogadores: pode trocar até 5 (todas).
   - 5 jogadores: pode trocar até 3.
5. Joga-se a mão (5 vazas). Conta-se quantas vazas cada jogador fez.

### Copas no escuro
Se o jogador a escolher pedir **copas no escuro** ANTES de toda a gente ter as
cartas (antes da distribuição estar completa), a ronda joga-se em modo `escuro`.

## 3. Multiplicador da ronda

| Modo da ronda        | Multiplicador |
|----------------------|:-------------:|
| Trunfo normal (paus, espadas, ouros) | **×1** |
| Copas                | **×2** |
| Copas no escuro      | **×3** |

Nota: "copas" pode surgir por escolha (pediu copas) ou por virar (a carta virada
saiu copas — "virou copas", azar).

## 4. Obrigatoriedade de ir a jogo

A app tem de validar/avisar:

1. **Trunfo paus:** todos são obrigados a ir a jogo nessa ronda.
2. **Quem escolhe o trunfo** nunca pode passar na sua vez (vai sempre).
3. **Regra do passar:** um jogador pode passar no máximo **2 vezes seguidas**.
   À 3ª vez seguida é obrigado a ir. (Contador reinicia quando vai a jogo.)
4. **Pontos baixos:** jogador com **5 pontos ou menos** é obrigado a ir a jogo,
   até voltar a ter 6+.

Quem **passa** (não vai a jogo) não ganha nem perde pontos nessa ronda (fica a 0).

## 5. Pontuação no fim de cada ronda

`M` = multiplicador da ronda (1, 2 ou 3).

Para cada jogador que **foi a jogo**:

### 5.1 Fez pelo menos 1 vaza
Tira `vazas × M` pontos.
> Ex: 3 vazas, copas (M=2) → tira 6.
Aplica-se a todos os que foram a jogo, **incluindo quem pediu/virou**.

### 5.2 Foi a jogo e NÃO fez vazas (falhou)

Jogador normal (não é quem pediu/virou):
- leva `5 × M` pontos (5 / 10 / 15).

Quem **escolheu** o trunfo e falhou:
| Modo    | Penalização |
|---------|:-----------:|
| Normal  | **+10** |
| Copas   | **+20** |
| Escuro  | **+15** |

Quem **virou** o trunfo e falhou:
| Modo    | Penalização |
|---------|:-----------:|
| Normal  | **+5**  |
| Copas   | **+10** |

> Regra de leitura: a penalização especial de quem pede/vira SÓ se aplica quando
> falha (0 vazas). Se quem pede/vira faz vazas, tira normal (`vazas × M`), sem
> nada de especial.

### 5.3 Quem passou
0 pontos nessa ronda.

## 6. Fim do jogo e dinheiro

- No início acorda-se **valor por ponto** (ex: 0,20 €).
- O jogo termina quando alguém chega a **0 ou menos**.
- Não precisa ser exato: podes "passar" o zero e ganhas na mesma.
- **Vencedor:** o primeiro a chegar a 0 (ou abaixo).

### Empate na mesma ronda
Se dois jogadores chegam a 0 na mesma ronda, desempata **quem fez a vaza que o
levou a 0 primeiro** (ordem dentro da ronda).
- O que chegou a 0 mas não foi o primeiro: **não paga nem recebe**.

### Conta final
Cada perdedor (pontos restantes > 0) paga `pontos_restantes × valor_por_ponto`.
O vencedor recebe a soma de todos esses pagamentos.

> Ex (0,20 €/ponto): vencedor a 0; outros a 8, 5 e 12 pontos.
> Pagam 1,60 € / 1,00 € / 2,40 €. Vencedor recebe 5,00 €.

## 7. Diferenças com 5 jogadores

Tudo igual, exceto:
- Na fase de troca só se pode trocar **até 3 cartas** (com 4 jogadores era até 5).

(A mecânica de distribuição, escolha/vira, multiplicadores, obrigatoriedades e
conta final é a mesma.)

## 8. O que a app tem de registar por ronda (input)

Para calcular tudo, o ecrã de ronda precisa de recolher:
1. Quem é o jogador a escolher (roda automaticamente a cada ronda).
2. Modo: `escolheu` ou `virou`.
3. Trunfo/nipe → determina M (normal / copas / escuro).
   - `escuro` só é possível via pedido de copas no escuro.
4. Quem foi a jogo vs quem passou (respeitando obrigatoriedades).
5. Nº de vazas de cada jogador que foi (soma tem de dar 5).
6. Em caso de dois a chegar a 0: qual foi o primeiro.

A app calcula: novos pontos de cada um, deteta fim de jogo, e no fim a conta em €.

## 9. Casos de teste (para validar a implementação)

Assumir 4 jogadores: A (escolhe), B, C, D. Valor 0,20 €/ponto.

**T1 — Normal, quem escolheu faz vazas:**
A escolhe espadas (M=1). Vazas: A=2, B=1, C=2, D=0. D foi a jogo.
→ A −2, B −1, C −2, D +5 (falhou, normal). A sem regra especial (fez vazas).

**T2 — Normal, quem escolheu falha:**
A escolhe ouros (M=1). Vazas: A=0, B=2, C=2, D=1. A foi (obrigatório).
→ A +10 (escolheu e falhou), B −2, C −2, D −1.

**T3 — Vira trunfo e falha:**
A vira, sai espadas (M=1). Vazas: A=0, B=3, C=2, D=0(passou).
→ A +5 (virou e falhou), B −3, C −2, D 0 (passou).

**T4 — Copas (escolhida), quem escolheu falha:**
A escolhe copas (M=2). Vazas: A=0, B=1, C=3, D=1.
→ A +20 (escolheu copas e falhou), B −2, C −6, D −2.

**T5 — Virou copas, falha:**
A vira, sai copas (M=2). Vazas: A=0, B=2, C=2, D=1.
→ A +10 (virou copas e falhou), B −4, C −4, D −2.

**T6 — Copas no escuro:**
A pede copas no escuro (M=3). Vazas: A=1, B=0, C=3, D=1.
→ A −3 (fez vaga, tira 1×3), B +15 (falhou escuro), C −9, D −3.

**T7 — Paus, todos obrigados:**
A escolhe paus (M=1). Vazas: A=2, B=0, C=2, D=1. Todos foram (obrigatório paus).
→ A −2, B +5 (falhou), C −2, D −1.

**T8 — Passa o zero:**
A com 3 pontos, escolhe espadas, faz 4 vazas (M=1) → A −4 → fica a −1. Ganha.
