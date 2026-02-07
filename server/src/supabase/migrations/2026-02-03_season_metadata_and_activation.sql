-- Season metadata + activation timestamps

alter table public.seasons
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists activated_at timestamptz;
