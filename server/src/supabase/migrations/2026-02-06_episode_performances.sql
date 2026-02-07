-- Episode-aware performances + queue

-- 1) Performances: add episode column + unique by season/agent/episode
alter table public.performances
  add column if not exists episode int;

-- backfill existing rows to episode 1
update public.performances
  set episode = 1
  where episode is null;

-- enforce episode values
DO $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'performances_episode_check'
  ) then
    alter table public.performances
      add constraint performances_episode_check
      check (episode in (1,2));
  end if;
end $$;

-- replace unique constraint (season_id, agent_id) -> (season_id, agent_id, episode)
DO $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'performances_season_id_agent_id_key'
  ) then
    alter table public.performances drop constraint performances_season_id_agent_id_key;
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'performances_season_agent_episode_key'
  ) then
    alter table public.performances
      add constraint performances_season_agent_episode_key unique (season_id, agent_id, episode);
  end if;
end $$;

-- 2) Performance queue: add episode + unique by season/agent/episode
alter table public.performance_queue
  add column if not exists episode int;

update public.performance_queue
  set episode = 1
  where episode is null;

DO $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'performance_queue_episode_check'
  ) then
    alter table public.performance_queue
      add constraint performance_queue_episode_check
      check (episode in (1,2));
  end if;
end $$;

DO $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'performance_queue_season_id_agent_id_key'
  ) then
    alter table public.performance_queue drop constraint performance_queue_season_id_agent_id_key;
  end if;
end $$;

DO $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'performance_queue_season_agent_episode_key'
  ) then
    alter table public.performance_queue
      add constraint performance_queue_season_agent_episode_key unique (season_id, agent_id, episode);
  end if;
end $$;

create index if not exists performance_queue_season_episode_idx on public.performance_queue (season_id, episode, status, position);
