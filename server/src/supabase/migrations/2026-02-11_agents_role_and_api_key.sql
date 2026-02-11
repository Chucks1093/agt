-- Agents: role default + admin role + remove api_key (keep api_key_hash)

alter table public.agents
  add column if not exists role text not null default 'PARTICIPANT';

update public.agents
  set role = 'ADMIN'
  where lower(wallet_address) = lower('0x7DdF5E3ee66e28f8A1477697e3c208C9d7795136');

alter table public.agents
  drop column if exists api_key;
