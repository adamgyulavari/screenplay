-- Notes on screenplay text: position (dialogue + char range), content, author, soft-delete for history.
create table public.screenplay_notes (
  id uuid primary key default gen_random_uuid(),
  screenplay_id uuid not null references public.screenplays (id) on delete cascade,
  dialogue_index int not null,
  start_index int not null,
  end_index int not null,
  note_content text not null,
  author_id uuid references auth.users (id) on delete set null,
  author_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index screenplay_notes_screenplay_id on public.screenplay_notes (screenplay_id);
create index screenplay_notes_deleted_at on public.screenplay_notes (deleted_at) where deleted_at is null;

alter table public.screenplay_notes enable row level security;

-- Anyone with access to the screenplay can manage notes (select/insert/update/delete).
create policy "Users with screenplay access can select notes"
  on public.screenplay_notes for select
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

create policy "Users with screenplay access can insert notes"
  on public.screenplay_notes for insert
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

create policy "Users with screenplay access can update notes"
  on public.screenplay_notes for update
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

create policy "Users with screenplay access can delete notes"
  on public.screenplay_notes for delete
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

create trigger screenplay_notes_updated_at
  before update on public.screenplay_notes
  for each row execute function public.set_updated_at();
