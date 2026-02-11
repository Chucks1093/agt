-- Add api_key_hash to agents; remove claimed

alter table public.agents
  add column if not exists api_key_hash text;

alter table public.agents
  drop column if exists claimed;

create index if not exists agents_api_key_hash_idx on public.agents (api_key_hash);
