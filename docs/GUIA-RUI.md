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

## 2b. Dois ajustes no Supabase para as contas funcionarem (importante)

As contas já estão ligadas e no ar. Faltam **dois cliques** no painel do Supabase
para o registo funcionar bem para os teus amigos:

**A) Definir o endereço do site** (senão o email de confirmação aponta para o sítio errado)
1. No Supabase: **Authentication** → **URL Configuration**.
2. Em **Site URL** mete: `https://ruisousaferreiraims.github.io/scorard/`
3. Em **Redirect URLs** carrega **Add URL** e mete o mesmo. Guarda.

**B) Escolher se há confirmação por email** (agora está LIGADA)
- **Authentication** → **Providers** → **Email**.
- Se **deixares ligado "Confirm email"**: cada pessoa recebe um email e tem de
  clicar para ativar a conta (mais seguro, mas um passo extra).
- Se **desligares "Confirm email"**: a conta fica ativa logo ao registar (mais
  simples para um grupo de amigos). Recomendo desligar para começar.
- Diz-me qual preferes — não muda nada no código, é só a tua escolha no painel.

> Testei a ligação: o projeto responde e a chave é válida. Só faltam estes ajustes
> para o registo ficar redondo.

## 2c. Colar o SQL das tabelas (para os jogos irem para a conta)

**Porque tens de ser tu:** eu consigo falar com o Supabase com a chave *pública*
(criar contas, entrar) — mas **criar tabelas exige a chave de administrador**, que
tu nunca me deves dar (quem a tiver controla a base de dados toda). Por isso o
desenho é este: eu escrevo o SQL, tu colas. Leva 30 segundos e é uma vez só.

**Como:** Supabase → menu **SQL Editor** → **New query** → cola o bloco abaixo →
botão **Run**. Deve aparecer "Success".

```sql
-- Perfis (um por conta)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- Jogos favoritos
create table if not exists public.favorites (
  user_id uuid references auth.users on delete cascade,
  game_id text not null,
  created_at timestamptz default now(),
  primary key (user_id, game_id)
);

-- Jogos terminados (o histórico, guardado na conta)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  game_id text not null,
  players jsonb not null,
  setup jsonb not null,
  rounds jsonb not null,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now()
);

-- Segurança: cada pessoa só vê e mexe no que é dela
alter table public.profiles  enable row level security;
alter table public.favorites enable row level security;
alter table public.sessions  enable row level security;

create policy "perfil proprio" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "favoritos proprios" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sessoes proprias" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Criar o perfil automaticamente quando alguém se regista
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

Quando correres isto, avisa-me: eu ligo os favoritos e o histórico à conta (passam
a seguir-te em qualquer telemóvel).

## 2e. SEGUNDO bloco de SQL — amigos e sessões ao vivo

Mesma coisa do 2c: **SQL Editor → New query → colar → Run**. Isto cria as tabelas
para os **amigos** (Fase 3) e para a **sessão ao vivo com comentários** (Fase 4).
Avisa-me quando correres e eu implemento as duas.

```sql
-- ---------- AMIGOS ----------
-- Pedido de amizade: de quem parte (user_id) para quem recebe (friend_id).
create table if not exists public.friendships (
  user_id uuid references auth.users on delete cascade not null,
  friend_id uuid references auth.users on delete cascade not null,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

alter table public.friendships enable row level security;

-- Vejo as amizades onde eu entro (as que enviei e as que recebi)
create policy "ver amizades minhas" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);
-- Só posso criar pedidos em meu nome
create policy "enviar pedido" on public.friendships
  for insert with check (auth.uid() = user_id);
-- Quem recebe pode aceitar; qualquer um dos dois pode remover
create policy "aceitar pedido" on public.friendships
  for update using (auth.uid() = friend_id);
create policy "remover amizade" on public.friendships
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- Para encontrar amigos por email é preciso poder procurar perfis.
-- Guardamos o email no perfil (só para pesquisa) e deixamos ver os campos
-- públicos de qualquer perfil — nome e email, nada mais.
alter table public.profiles add column if not exists email text;

create policy "procurar perfis" on public.profiles
  for select using (true);

-- preencher o email nos perfis que já existem
update public.profiles p
  set email = u.email
  from auth.users u
  where u.id = p.id and p.email is null;

-- e nos novos (substitui a função do bloco anterior)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, split_part(new.email, '@', 1), new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end; $$;

-- ---------- SESSÃO AO VIVO ----------
-- A sessão ao vivo guarda a lista de rondas (event sourcing, como na app).
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users on delete cascade not null,
  game_id text not null,
  players jsonb not null,
  setup jsonb not null,
  rounds jsonb not null default '[]'::jsonb,
  finished boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quem pode ESCREVER o resultado (o dono + jogadores com conta convidados)
create table if not exists public.live_players (
  session_id uuid references public.live_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now(),
  primary key (session_id, user_id)
);

create table if not exists public.live_comments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.live_sessions on delete cascade not null,
  user_id uuid references auth.users on delete set null,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz default now()
);

alter table public.live_sessions enable row level security;
alter table public.live_players  enable row level security;
alter table public.live_comments enable row level security;

-- Qualquer pessoa com o link vê a sessão (é esse o objetivo: acompanhar)
create policy "ver sessao ao vivo" on public.live_sessions for select using (true);
create policy "ver jogadores"      on public.live_players  for select using (true);
create policy "ver comentarios"    on public.live_comments for select using (true);

-- Só o dono cria e apaga
create policy "criar sessao" on public.live_sessions
  for insert with check (auth.uid() = owner_id);
create policy "apagar sessao" on public.live_sessions
  for delete using (auth.uid() = owner_id);

-- Escrever o resultado: dono OU jogador convidado
create policy "editar resultado" on public.live_sessions
  for update using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.live_players lp
      where lp.session_id = id and lp.user_id = auth.uid()
    )
  );

-- Só o dono convida/remove jogadores
create policy "gerir jogadores" on public.live_players
  for all using (
    exists (select 1 from public.live_sessions s
            where s.id = session_id and s.owner_id = auth.uid())
  );

-- Comentar: qualquer pessoa autenticada, em nome próprio
create policy "comentar" on public.live_comments
  for insert with check (auth.uid() = user_id);
create policy "apagar comentario proprio" on public.live_comments
  for delete using (auth.uid() = user_id);

-- Realtime: enviar as alterações para quem está a ver
alter publication supabase_realtime add table public.live_sessions;
alter publication supabase_realtime add table public.live_comments;
```

> Nota de privacidade: quem tiver o link vê a sessão (nomes e pontuações) — é o
> que faz sentido para "acompanhar o jogo". Alterar o resultado é que fica
> reservado ao dono e aos jogadores convidados.

## 2f. TERCEIRO bloco de SQL — sugestões dos utilizadores (opcional)

O botão **"O teu jogo não está aqui?"** já funciona: se esta tabela não existir,
oferece mandar por email para ti. Com a tabela, as sugestões ficam guardadas e
podes vê-las todas de uma vez no painel do Supabase (**Table Editor → feedback**),
o que é bem mais prático quando começarem a chegar muitas.

**SQL Editor → New query → colar → Run:**

```sql
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  author_name text,
  kind text not null check (kind in ('jogo','ideia','problema')),
  game_name text,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

-- Qualquer pessoa pode enviar (mesmo sem conta), mas ninguém pode ler o que os
-- outros escreveram — as sugestões só se veem no painel do Supabase.
create policy "enviar sugestao" on public.feedback
  for insert with check (true);
```

> Não criei política de leitura de propósito: assim as sugestões não ficam
> expostas na app a quem tiver o link. Tu lês no painel do Supabase.

## 2d. Botão de pagar (MB WAY) — o que é possível, honestamente

Pedido dos jogadores: um botão para pagar no fim do jogo. O que dá e o que não dá:

**Não dá (de graça):** integrar pagamentos a sério dentro da app. O MB WAY não tem
uma forma pública de um site pedir dinheiro a alguém. Para isso é preciso um
contrato de comerciante com a SIBS (ou Stripe/etc.), que envolve empresa, taxas por
transação e verificação. Fica fora do orçamento zero — e para um jogo entre amigos
seria exagero.

**Dá, e é quase tão útil:** a app resolve a parte chata, que são as **contas**:

1. **Acerto de contas** no fim: em vez de "cada um está a +3,40 / −1,20 / …", a app
   calcula **quem paga a quem**, com o **mínimo de transferências** possível
   (ex: em vez de 6 transferências, só 2: "Bea → Rui 3,40 €", "Caz → Rui 1,20 €").
2. **Número de telemóvel** opcional em cada jogador (guardado só no telemóvel de
   quem marca, ou na conta). Aparece ao lado de quem recebe.
3. **Botão "Enviar acerto"** que manda tudo para o WhatsApp do grupo já escrito:
   quem paga, a quem, quanto e o número para o MB WAY. Cada um abre o MB WAY e
   paga em 5 segundos.

Ou seja: a app não move dinheiro (nem deve), mas tira todo o trabalho de perceber
quem deve a quem. Diz-me se queres isto e eu implemento.

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
