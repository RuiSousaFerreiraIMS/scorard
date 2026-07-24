# Guia do Rui — o que só tu podes fazer

Este guia junta os passos manuais que a Claude não pode fazer sozinha (criar contas,
meter chaves) e as coisas úteis do dia-a-dia. Segue por ordem.

---

## 1. Ver a app / atualizar no telemóvel

A app está em: **https://ruisousaferreiraims.github.io/scorard/**

- **Android (Chrome):** abre o link → aparece "Instalar" → fica com ícone.
- **iPhone (Safari):** abre o link → botão Partilhar → "Adicionar ao ecrã inicial".
- Já instalada e queres a versão nova? Fecha e reabre a app; se não atualizar,
  desinstala e volta a instalar pelo link. (Cada `git push` republica em ~2 min.)

---

## 2. Criar o backend gratuito (Supabase) — desbloqueia contas, amigos, estatísticas e ao vivo

Isto é o passo mais importante que só tu podes dar. É grátis. Demora ~10 minutos.

1. Vai a **https://supabase.com** e carrega em **Start your project** (entra com o GitHub, é o mais rápido).
2. **New project**:
   - **Name:** `scorard`
   - **Database Password:** gera uma forte e **guarda-a** (num gestor de passwords).
   - **Region:** escolhe `West EU (London)` ou `Central EU (Frankfurt)` (mais perto = mais rápido).
   - Carrega **Create new project** e espera ~2 min a provisionar.
3. Quando abrir, no menu vai a **Project Settings** (ícone engrenagem) → **API**.
4. Copia estes dois valores:
   - **Project URL** (algo como `https://xxxxxxxx.supabase.co`)
   - **anon public** key (uma string longa em "Project API keys")
5. **Guarda os dois** e dá-mos quando voltarmos a trabalhar. A `anon` key é
   pública por design (pode ir no frontend); a segurança faz-se por regras na
   base de dados (RLS), que eu configuro.

> Não precisas de mexer em mais nada no Supabase — eu trato das tabelas, do login
> e das permissões a partir daí.

**O que NÃO deves partilhar comigo:** a *Database Password* do passo 2 nem a chave
`service_role` (essa é secreta). Só preciso da **Project URL** e da **anon public**.

---

## 3. Decisões que preciso de ti (para as próximas fases)

Quando voltarmos, responde a isto (podes já ir pensando):

1. **Login:** só email/password, ou também "Entrar com Google"? (o Google é mais
   cómodo mas precisa de uns cliques extra de configuração — eu guio-te).
2. **Estrela de favorito no detalhe:** deixo à direita (como agora, igual ao teu
   screenshot) ou queres à esquerda?
3. **Separador "Amigos":** entra na Fase 3. Confirmas a ordem das fases
   (contas → estatísticas → amigos → ao vivo) ou queres o "ao vivo" mais cedo?

---

## 4. Correr a app no teu PC (opcional, se quiseres experimentar local)

Precisas de Node.js instalado. Na pasta do projeto:

```bash
npm install       # só a primeira vez
npm run dev       # abre em http://localhost:5173/scorard/
npm test          # corre os testes
npm run build     # gera a versão de produção
```

Publicar é automático: sempre que se faz `git push` para `main`, o GitHub Actions
faz build, corre os testes e publica. Não precisas de fazer nada manual.

---

## 5. Estado atual (o que já está feito)

- **Jogos:** Fodinha e Sobe e Desce, com contas automáticas (33 testes a validar).
- **Fase 0 (redesenho):** casca de app com navegação de fundo, hub de jogos com
  detalhe/regras/favoritos, perfil com estatísticas locais. **Publicado.**
- **Partilha por link:** versão "foto" (read-only). A versão **ao vivo** vem na Fase 4
  (precisa do Supabase do passo 2).

**Próximo quando voltares:** dás-me as duas chaves do Supabase (passo 2) e as
respostas do passo 3, e arrancamos a Fase 1 (contas). Sem isso, posso continuar a
polir a interface (setup/jogo/resultados) sem depender de nada.
