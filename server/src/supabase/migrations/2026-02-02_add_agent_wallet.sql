-- Add wallet_address to agents for MVP (so we can upsert agent identity by connected wallet)
alter table public.agents
  add column if not exists wallet_address text;

-- Keep wallet unique when present
create unique index if not exists agents_wallet_uniq
  on public.agents (wallet_address)
  where wallet_address is not null;
