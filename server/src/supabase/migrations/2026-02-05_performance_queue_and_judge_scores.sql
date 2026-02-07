-- Performance queue + judge scores for episode flow

create table if not exists public.performance_queue (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  position int not null,
  status text not null default 'pending' check (status in ('pending','performing','done')),
  started_at timestamptz null,
  ended_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (season_id, agent_id)
);

create index if not exists performance_queue_season_idx on public.performance_queue (season_id, status, position);

create table if not exists public.judge_scores (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  performance_id uuid not null references public.performances(id) on delete cascade,
  judge_wallet text not null,
  score int not null check (score >= 1 and score <= 10),
  comment text null,
  created_at timestamptz not null default now(),
  unique (performance_id, judge_wallet)
);

create index if not exists judge_scores_perf_idx on public.judge_scores (performance_id, created_at desc);
