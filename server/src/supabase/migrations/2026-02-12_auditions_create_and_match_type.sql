-- Create auditions table and align with Audition type

create table if not exists public.auditions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  agent_name text not null,
  wallet_address text not null,
  category text not null check (category in ('comedy','poetry','code','art','music','video','animation','other')),
  title text not null,
  content text not null,
  content_type text not null check (content_type in ('text','image','video','code','audio')),
  content_url text,
  status text not null default 'pending' check (status in ('pending','reviewing','accepted','rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  review_notes text,
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill/rename older column names if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'auditions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.auditions RENAME COLUMN created_at TO submitted_at;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'auditions' AND column_name = 'reviewed_by_wallet'
  ) THEN
    ALTER TABLE public.auditions RENAME COLUMN reviewed_by_wallet TO reviewed_by;
  END IF;
END $$;

-- Ensure all columns exist and match the Audition type
alter table public.auditions
  add column if not exists season_id uuid,
  add column if not exists agent_id uuid,
  add column if not exists agent_name text,
  add column if not exists wallet_address text,
  add column if not exists category text,
  add column if not exists title text,
  add column if not exists content text,
  add column if not exists content_type text,
  add column if not exists content_url text,
  add column if not exists status text,
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text,
  add column if not exists rejection_reason text,
  add column if not exists submitted_at timestamptz,
  add column if not exists updated_at timestamptz;

alter table public.auditions
  alter column season_id set not null,
  alter column agent_id set not null,
  alter column agent_name set not null,
  alter column wallet_address set not null,
  alter column category set not null,
  alter column title set not null,
  alter column content set not null,
  alter column content_type set not null,
  alter column status set not null,
  alter column submitted_at set not null,
  alter column updated_at set not null;

alter table public.auditions
  alter column status set default 'pending',
  alter column submitted_at set default now(),
  alter column updated_at set default now();

-- Drop legacy columns no longer in the Audition type
alter table public.auditions
  drop column if exists display_name,
  drop column if exists talent,
  drop column if exists pitch,
  drop column if exists sample_url,
  drop column if exists performance_title,
  drop column if exists short_bio,
  drop column if exists model,
  drop column if exists social_link,
  drop column if exists golden_buzzer,
  drop column if exists golden_buzzer_at;

-- Constraints + indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'auditions_category_check'
  ) THEN
    ALTER TABLE public.auditions
      ADD CONSTRAINT auditions_category_check
      CHECK (category in ('comedy','poetry','code','art','music','video','animation','other'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'auditions_content_type_check'
  ) THEN
    ALTER TABLE public.auditions
      ADD CONSTRAINT auditions_content_type_check
      CHECK (content_type in ('text','image','video','code','audio'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'auditions_status_check'
  ) THEN
    ALTER TABLE public.auditions
      ADD CONSTRAINT auditions_status_check
      CHECK (status in ('pending','reviewing','accepted','rejected'));
  END IF;
END $$;

create unique index if not exists auditions_unique_season_agent
  on public.auditions (season_id, agent_id);

create index if not exists auditions_by_season
  on public.auditions (season_id);

create index if not exists auditions_by_agent
  on public.auditions (agent_id);

-- RLS
alter table public.auditions enable row level security;

-- Public read
create policy if not exists "auditions_public_read"
  on public.auditions
  for select
  to anon, authenticated
  using (true);

-- Registered agents can submit auditions (authenticated)
create policy if not exists "auditions_insert_registered_agent"
  on public.auditions
  for insert
  to authenticated
  with check (
    exists (select 1 from public.agents a where a.id = auditions.agent_id)
  );

-- Registered agents can update their own auditions (optional)
create policy if not exists "auditions_update_own"
  on public.auditions
  for update
  to authenticated
  using (
    exists (select 1 from public.agents a where a.id = auditions.agent_id)
  )
  with check (
    exists (select 1 from public.agents a where a.id = auditions.agent_id)
  );
