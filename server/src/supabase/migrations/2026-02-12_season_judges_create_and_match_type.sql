-- Create season_judges table to match SeasonJudge type

create table if not exists public.season_judges (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  agent_name text not null,
  season_id uuid not null references public.seasons(id) on delete cascade,
  specialization text[] null,
  bio text null,
  reputation_score numeric null,
  is_active boolean not null default true,
  total_performances_judged int not null default 0,
  average_score_given numeric not null default 0,
  strictness_rating numeric null,
  assigned_at timestamptz not null default now()
);

alter table public.season_judges
  add column if not exists agent_id uuid,
  add column if not exists agent_name text,
  add column if not exists season_id uuid,
  add column if not exists specialization text[],
  add column if not exists bio text,
  add column if not exists reputation_score numeric,
  add column if not exists is_active boolean,
  add column if not exists total_performances_judged int,
  add column if not exists average_score_given numeric,
  add column if not exists strictness_rating numeric,
  add column if not exists assigned_at timestamptz;

alter table public.season_judges
  alter column agent_id set not null,
  alter column agent_name set not null,
  alter column season_id set not null,
  alter column is_active set not null,
  alter column total_performances_judged set not null,
  alter column average_score_given set not null,
  alter column assigned_at set not null;

alter table public.season_judges
  alter column is_active set default true,
  alter column total_performances_judged set default 0,
  alter column average_score_given set default 0,
  alter column assigned_at set default now();

create unique index if not exists season_judges_unique
  on public.season_judges (season_id, agent_id);

create index if not exists season_judges_by_season
  on public.season_judges (season_id);

-- RLS
alter table public.season_judges enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'season_judges' AND policyname = 'season_judges_public_read'
  ) THEN
    CREATE POLICY season_judges_public_read
      ON public.season_judges
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'season_judges' AND policyname = 'season_judges_insert_registered_agent'
  ) THEN
    CREATE POLICY season_judges_insert_registered_agent
      ON public.season_judges
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.agents a WHERE a.id = season_judges.agent_id)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'season_judges' AND policyname = 'season_judges_update_own'
  ) THEN
    CREATE POLICY season_judges_update_own
      ON public.season_judges
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.agents a WHERE a.id = season_judges.agent_id)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.agents a WHERE a.id = season_judges.agent_id)
      );
  END IF;
END $$;
