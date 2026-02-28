-- screenplay_access: links users to screenplays and stores per-user progress.
-- Enables: (1) multiple users per screenplay, (2) progress persisted across devices.
create table public.screenplay_access (
  id uuid primary key default gen_random_uuid(),
  screenplay_id uuid not null references public.screenplays (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  character_role text,
  current_dialogue_index int not null default 0,
  current_segment_index int not null default 0,
  updated_at timestamptz not null default now(),
  unique (screenplay_id, user_id)
);

alter table public.screenplay_access enable row level security;

create policy "Users can select own access"
  on public.screenplay_access for select
  using (auth.uid() = user_id);

create policy "Users can insert own access"
  on public.screenplay_access for insert
  with check (auth.uid() = user_id);

create policy "Users can update own access"
  on public.screenplay_access for update
  using (auth.uid() = user_id);

create policy "Users can delete own access"
  on public.screenplay_access for delete
  using (auth.uid() = user_id);

create trigger screenplay_access_updated_at
  before update on public.screenplay_access
  for each row execute function public.set_updated_at();

-- Migrate screenplays: user_id -> owner_id, give owners access
alter table public.screenplays rename column user_id to owner_id;

insert into public.screenplay_access (screenplay_id, user_id, current_dialogue_index, current_segment_index)
select id, owner_id, 0, 0 from public.screenplays
on conflict (screenplay_id, user_id) do nothing;

-- RLS: users can access screenplays they own OR have screenplay_access
drop policy if exists "Users can select own screenplays" on public.screenplays;
drop policy if exists "Users can insert own screenplays" on public.screenplays;
drop policy if exists "Users can update own screenplays" on public.screenplays;
drop policy if exists "Users can delete own screenplays" on public.screenplays;

create policy "Users can select screenplays they own or have access to"
  on public.screenplays for select
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.screenplay_access a
      where a.screenplay_id = screenplays.id and a.user_id = auth.uid()
    )
  );

create policy "Users can insert screenplays as owner"
  on public.screenplays for insert
  with check (auth.uid() = owner_id);

create policy "Users can update screenplays they own"
  on public.screenplays for update
  using (auth.uid() = owner_id);

create policy "Users can delete screenplays they own"
  on public.screenplays for delete
  using (auth.uid() = owner_id);

-- Ensure owner always has a screenplay_access record (for persistence to work)
create or replace function public.create_owner_access()
returns trigger as $$
begin
  insert into public.screenplay_access (screenplay_id, user_id, current_dialogue_index, current_segment_index)
  values (new.id, new.owner_id, 0, 0)
  on conflict (screenplay_id, user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger screenplays_create_owner_access
  after insert on public.screenplays
  for each row execute function public.create_owner_access();
