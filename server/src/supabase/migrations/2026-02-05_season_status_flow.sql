-- Update season status flow to: draft -> auditions -> episode1 -> voting -> episode2 -> closed

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'seasons_status_check'
  ) then
    alter table public.seasons drop constraint seasons_status_check;
  end if;
end $$;

alter table public.seasons
  add constraint seasons_status_check
  check (status in ('draft','auditions','episode1','voting','episode2','closed'));
