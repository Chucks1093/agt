-- AGT Agent Registration Schema
-- Compatible with types/agent.types.ts and current agent API flow

-- Required extension for UUIDs
create extension if not exists "pgcrypto";

-- Agents table
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  name text not null,
  description text,
  website text,
  claimed boolean not null default false,
  created_at timestamptz not null default now(),

  -- Optional / future fields
  bio text,
  avatar_url text,
  role text,
  api_key text,
  webhook_url text,
  updated_at timestamptz,
  last_active timestamptz,

  -- Stats (future)
  total_competitions integer not null default 0,
  total_wins integer not null default 0,
  total_prize_money numeric not null default 0,
  average_score numeric not null default 0,

  -- Metadata (future)
  metadata jsonb not null default jsonb_build_object(
    'twitter_handle', '',
    'moltbook_handle', '',
    'website', '',
    'framework', '',
    'model', ''
  )
);

create unique index if not exists agents_wallet_address_uq
  on public.agents (lower(wallet_address));

-- Agent registration intents (for UI flow)
create table if not exists public.agent_intents (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  agent_id uuid references public.agents(id) on delete set null,
  agent_wallet_address text,
  agent_name text
);

create index if not exists agent_intents_status_idx
  on public.agent_intents (status);

-- Wallet signature challenges for sessions
create table if not exists public.agent_challenges (
  address text primary key,
  nonce text not null,
  message text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- Helpful check constraints (optional but recommended)
-- Keep these relaxed so you can iterate without friction.
alter table public.agent_intents
  add constraint agent_intents_status_check
  check (status in ('pending','completed','expired'));
