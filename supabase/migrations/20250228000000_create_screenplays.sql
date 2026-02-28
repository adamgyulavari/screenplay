-- Screenplays table: one row per user for now (extend later for multiple screenplays)
create table public.screenplays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text default 'My screenplay',
  author text,
  content jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.screenplays enable row level security;

-- Users can only access their own screenplays
create policy "Users can select own screenplays"
  on public.screenplays for select
  using (auth.uid() = user_id);

create policy "Users can insert own screenplays"
  on public.screenplays for insert
  with check (auth.uid() = user_id);

create policy "Users can update own screenplays"
  on public.screenplays for update
  using (auth.uid() = user_id);

create policy "Users can delete own screenplays"
  on public.screenplays for delete
  using (auth.uid() = user_id);

-- Optional: keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger screenplays_updated_at
  before update on public.screenplays
  for each row execute function public.set_updated_at();
