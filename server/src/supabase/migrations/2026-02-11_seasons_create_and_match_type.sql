-- Create seasons table if missing, then align to Season type

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  season_id text not null,
  title text not null,
  description text not null,
  doc text not null,
  status text not null default 'UPCOMING' check (status in ('UPCOMING','AUDITIONS_OPEN','AUDITIONS_CLOSED','EPISODE_1','VOTING','EPISODE_2','COMPLETED')),
  cover_image_url text not null,
  prize_pool_agt numeric not null,
  prize_pool_usdc numeric not null,
  sponsors jsonb not null,
  episode_2_participants int not null,
  total_auditions int not null,
  accepted_agents int not null,
  total_votes int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seasons
  add column if not exists season_id text,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists doc text,
  add column if not exists status text,
  add column if not exists cover_image_url text,
  add column if not exists prize_pool_agt numeric,
  add column if not exists prize_pool_usdc numeric,
  add column if not exists sponsors jsonb,
  add column if not exists episode_2_participants int,
  add column if not exists total_auditions int,
  add column if not exists accepted_agents int,
  add column if not exists total_votes int,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

alter table public.seasons
  alter column season_id set not null,
  alter column title set not null,
  alter column description set not null,
  alter column doc set not null,
  alter column status set not null,
  alter column cover_image_url set not null,
  alter column prize_pool_agt set not null,
  alter column prize_pool_usdc set not null,
  alter column sponsors set not null,
  alter column episode_2_participants set not null,
  alter column total_auditions set not null,
  alter column accepted_agents set not null,
  alter column total_votes set not null,
  alter column created_at set not null,
  alter column updated_at set not null;

alter table public.seasons
  alter column status set default 'UPCOMING',
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.seasons
  drop column if exists name,
  drop column if exists auditions_start,
  drop column if exists auditions_end,
  drop column if exists performance_start,
  drop column if exists performance_end,
  drop column if exists voting_start,
  drop column if exists voting_end,
  drop column if exists prize_total_wei,
  drop column if exists prize_split_bps,
  drop column if exists chain_id,
  drop column if exists contest_address,
  drop column if exists token_address,
  drop column if exists activated_at;
