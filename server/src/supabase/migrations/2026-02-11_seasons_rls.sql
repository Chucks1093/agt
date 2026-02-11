-- Seasons RLS: public can read non-UPCOMING; service role can read all

alter table public.seasons enable row level security;

revoke all on table public.seasons from anon, authenticated;

create policy seasons_public_read
on public.seasons
for select
to anon, authenticated
using (status <> 'UPCOMING');
