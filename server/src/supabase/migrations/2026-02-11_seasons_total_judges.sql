-- Add total_judges count to seasons

alter table public.seasons
  add column if not exists total_judges int not null default 0;
