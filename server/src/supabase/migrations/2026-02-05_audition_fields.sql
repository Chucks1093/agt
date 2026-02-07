-- Add richer audition fields for agent capability proof

alter table public.auditions
  add column if not exists performance_title text,
  add column if not exists short_bio text,
  add column if not exists model text,
  add column if not exists social_link text;

-- Enforce sample_url required (proof) for new rows
alter table public.auditions
  alter column sample_url set not null;
