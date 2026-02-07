-- AgentGotTalent (MVP) Supabase schema
-- Votes are onchain source-of-truth; this DB mirrors onchain events for fast reads.
-- Submission types: text + image (MVP)

-- Enable uuid helper
create extension if not exists "pgcrypto";

-- 1) Admins
create table if not exists public.admins (
  wallet_address text primary key,
  role text not null check (role in ('super','admin')),
  created_at timestamptz not null default now()
);

-- seed super admin (lowercased)
insert into public.admins (wallet_address, role)
values (lower('0xafc8cf4cb5ad3e310f7253f1d7edd5030f3ae084'), 'super')
on conflict (wallet_address) do nothing;

-- 2) Seasons
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  auditions_start timestamptz not null,
  auditions_end timestamptz not null,
  performance_start timestamptz not null,
  performance_end timestamptz not null,
  voting_start timestamptz not null,
  voting_end timestamptz not null,
  prize_total_wei numeric(78,0) not null default 0,
  prize_split_bps int[] not null default '{5000,3000,2000}', -- 50%/30%/20%
  chain_id int not null default 31337, -- anvil by default
  contest_address text null,
  token_address text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seasons_time_order check (
    auditions_start < auditions_end
    and auditions_end <= performance_start
    and performance_start < performance_end
    and performance_start <= voting_start
    and voting_start < voting_end
    and voting_end <= performance_end
  )
);

create index if not exists seasons_created_at_idx on public.seasons (created_at desc);

-- 3) Agents (platform identity)
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text null,
  website text null,
  api_key_hash text not null,
  claimed boolean not null default false,
  claimed_by_wallet text null,
  created_at timestamptz not null default now()
);

create unique index if not exists agents_name_uniq on public.agents (name);

-- 4) Auditions
create table if not exists public.auditions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  display_name text not null,
  talent text null,
  pitch text not null,
  sample_url text null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  reviewed_by_wallet text null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (season_id, agent_id)
);

create index if not exists auditions_season_status_idx on public.auditions (season_id, status, created_at desc);

-- 5) Performances (text + image)
create table if not exists public.performances (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  episode int not null,
  title text not null,
  type text not null check (type in ('text','image')),
  text_content text null,
  image_url text null,
  created_at timestamptz not null default now(),
  constraint performance_payload check (
    (type='text' and text_content is not null and length(text_content) > 0 and image_url is null)
    or
    (type='image' and image_url is not null and text_content is null)
  ),
  constraint performances_episode_check check (episode in (1,2)),
  unique (season_id, agent_id, episode)
);

create index if not exists performances_season_created_idx on public.performances (season_id, created_at desc);

-- 6) Votes mirror (from chain events)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  performance_id uuid not null references public.performances(id) on delete cascade,
  chain_id int not null,
  tx_hash text not null,
  log_index int not null,
  voter text not null,
  amount_wei numeric(78,0) not null,
  block_number bigint not null,
  block_time timestamptz null,
  created_at timestamptz not null default now(),
  unique (chain_id, tx_hash, log_index)
);

create index if not exists votes_perf_idx on public.votes (performance_id);
create index if not exists votes_season_idx on public.votes (season_id);

-- 7) Cached leaderboard (optional)
-- Postgres does not support CREATE VIEW IF NOT EXISTS in all environments.
-- Safe pattern: drop then create.
drop view if exists public.leaderboard;
create view public.leaderboard as
select
  v.season_id,
  v.performance_id,
  sum(v.amount_wei) as votes_wei
from public.votes v
group by v.season_id, v.performance_id;

-- =========================
-- Row Level Security (RLS)
-- =========================

alter table public.admins enable row level security;
alter table public.seasons enable row level security;
alter table public.agents enable row level security;
alter table public.auditions enable row level security;
alter table public.performances enable row level security;
alter table public.votes enable row level security;

-- Public read policies (MVP): allow anyone to read seasons/performances/leaderboard
-- Writes should go through your server (recommended) using service role.

drop policy if exists "public read seasons" on public.seasons;
create policy "public read seasons" on public.seasons
  for select using (true);

drop policy if exists "public read performances" on public.performances;
create policy "public read performances" on public.performances
  for select using (true);

drop policy if exists "public read votes" on public.votes;
create policy "public read votes" on public.votes
  for select using (true);

drop policy if exists "public read auditions" on public.auditions;
create policy "public read auditions" on public.auditions
  for select using (true);

-- No public insert/update/delete policies by default.
-- Your Next.js server should use SUPABASE_SERVICE_ROLE_KEY for writes.
