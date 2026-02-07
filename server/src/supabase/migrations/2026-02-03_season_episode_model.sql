-- AGT Season Episode Model (Episode 1 voting -> Episode 2 judges)
-- Safe, additive migration where possible.

-- 1) Seasons: status + episode windows + config
alter table public.seasons
  add column if not exists status text default 'draft',
  add column if not exists episode1_start timestamptz,
  add column if not exists episode1_end timestamptz,
  add column if not exists episode2_start timestamptz,
  add column if not exists episode2_end timestamptz,
  add column if not exists episode1_advances int default 12,
  add column if not exists max_golden_buzzers int default 2,
  add column if not exists created_by_wallet text,
  add column if not exists created_at timestamptz default now();

-- Optional: constrain status to known values
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'seasons_status_check'
  ) then
    alter table public.seasons
      add constraint seasons_status_check
      check (status in ('draft','auditions','episode1_voting','episode2_finals','closed'));
  end if;
end $$;

-- 2) Auditions: golden buzzer flags
alter table public.auditions
  add column if not exists golden_buzzer boolean default false,
  add column if not exists golden_buzzer_by_wallet text,
  add column if not exists golden_buzzer_at timestamptz;

-- 3) Season contestants (who is in episode 1 / episode 2)
create table if not exists public.season_contestants (
  season_id uuid not null references public.seasons(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  episode int not null,
  source text not null,
  created_at timestamptz not null default now(),
  primary key (season_id, agent_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'season_contestants_episode_check'
  ) then
    alter table public.season_contestants
      add constraint season_contestants_episode_check
      check (episode in (1,2));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'season_contestants_source_check'
  ) then
    alter table public.season_contestants
      add constraint season_contestants_source_check
      check (source in ('accepted','golden_buzzer','episode1_top12'));
  end if;
end $$;

create index if not exists season_contestants_season_episode_idx
  on public.season_contestants (season_id, episode);

-- 4) Season judges (up to 5 per season)
create table if not exists public.season_judges (
  season_id uuid not null references public.seasons(id) on delete cascade,
  wallet_address text not null,
  created_at timestamptz not null default now(),
  primary key (season_id, wallet_address)
);

-- 5) Judge scores (episode 2)
create table if not exists public.judge_scores (
  season_id uuid not null references public.seasons(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  judge_wallet text not null,
  score int not null,
  notes text,
  created_at timestamptz not null default now(),
  primary key (season_id, agent_id, judge_wallet)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'judge_scores_score_check'
  ) then
    alter table public.judge_scores
      add constraint judge_scores_score_check
      check (score >= 1 and score <= 10);
  end if;
end $$;

create index if not exists judge_scores_season_agent_idx
  on public.judge_scores (season_id, agent_id);
