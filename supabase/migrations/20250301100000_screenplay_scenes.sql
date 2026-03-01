-- Scene markers for screenplay navigation: dialogue_index + title.
create table public.screenplay_scenes (
  id uuid primary key default gen_random_uuid(),
  screenplay_id uuid not null references public.screenplays (id) on delete cascade,
  dialogue_index int not null,
  title text not null,
  created_at timestamptz not null default now()
);

create index screenplay_scenes_screenplay_id on public.screenplay_scenes (screenplay_id);

alter table public.screenplay_scenes enable row level security;

-- Anyone with access to the screenplay can manage scenes (select/insert/update/delete).
create policy "Users with screenplay access can select scenes"
  on public.screenplay_scenes for select
  using (
    exists (
      select 1 from public.screenplays s
      where s.id = screenplay_id
      and (s.owner_id = auth.uid() or exists (
        select 1 from public.screenplay_access a
        where a.screenplay_id = s.id and a.user_id = auth.uid()
      ))
    )
  );

create policy "Users with screenplay access can insert scenes"
  on public.screenplay_scenes for insert
  with check (
    exists (
      select 1 from public.screenplays s
      where s.id = screenplay_id
      and (s.owner_id = auth.uid() or exists (
        select 1 from public.screenplay_access a
        where a.screenplay_id = s.id and a.user_id = auth.uid()
      ))
    )
  );

create policy "Users with screenplay access can update scenes"
  on public.screenplay_scenes for update
  using (
    exists (
      select 1 from public.screenplays s
      where s.id = screenplay_id
      and (s.owner_id = auth.uid() or exists (
        select 1 from public.screenplay_access a
        where a.screenplay_id = s.id and a.user_id = auth.uid()
      ))
    )
  );

create policy "Users with screenplay access can delete scenes"
  on public.screenplay_scenes for delete
  using (
    exists (
      select 1 from public.screenplays s
      where s.id = screenplay_id
      and (s.owner_id = auth.uid() or exists (
        select 1 from public.screenplay_access a
        where a.screenplay_id = s.id and a.user_id = auth.uid()
      ))
    )
  );
