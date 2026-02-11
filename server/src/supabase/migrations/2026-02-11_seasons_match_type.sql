-- Align seasons table with Season type (simplified)

alter table public.seasons
  add column if not exists season_id text,
  add column if not exists title text,
  add column if not exists doc text,
  add column if not exists cover_image_url text,
  add column if not exists prize_pool_agt numeric,
  add column if not exists prize_pool_usdc numeric,
  add column if not exists sponsors jsonb,
  add column if not exists episode_2_participants int,
  add column if not exists total_auditions int,
  add column if not exists accepted_agents int,
  add column if not exists total_votes int;

alter table public.seasons
  drop column if exists name,
  drop column if exists description,
  drop column if exists image_url,
  drop column if exists auditions_start,
  drop column if exists auditions_end,
  drop column if exists performance_start,
  drop column if exists performance_end,
  drop column if exists voting_start,
  drop column if exists voting_end,
  drop column if exists episode1_start,
  drop column if exists episode1_end,
  drop column if exists episode2_start,
  drop column if exists episode2_end,
  drop column if exists prize_total_wei,
  drop column if exists prize_split_bps,
  drop column if exists chain_id,
  drop column if exists contest_address,
  drop column if exists token_address,
  drop column if exists activated_at;

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
  alter column total_votes set not null;
