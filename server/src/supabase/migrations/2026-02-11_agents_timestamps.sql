-- Agents: timestamps defaults + updated_at trigger

alter table public.agents
  alter column created_at set default now();

alter table public.agents
  add column if not exists updated_at timestamptz not null default now();

alter table public.agents
  add column if not exists last_active timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agents_set_updated_at on public.agents;
create trigger agents_set_updated_at
before update on public.agents
for each row
execute function public.set_updated_at();
