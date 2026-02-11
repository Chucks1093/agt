-- Seasons defaults for minimal create payload

alter table public.seasons
  alter column prize_pool_agt set default 0,
  alter column prize_pool_usdc set default 0,
  alter column sponsors set default '[]'::jsonb,
  alter column episode_2_participants set default 0,
  alter column total_auditions set default 0,
  alter column total_judges set default 0,
  alter column accepted_agents set default 0,
  alter column total_votes set default 0;
