-- Invitation system: allow owners to invite users by email even if they haven't
-- signed up yet. Pending invitations convert to screenplay_access rows
-- automatically when the invited user first signs in.

-- 1. Invitations table
create table public.screenplay_invitations (
  id uuid primary key default gen_random_uuid(),
  screenplay_id uuid not null references public.screenplays(id) on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (screenplay_id, email)
);

alter table public.screenplay_invitations enable row level security;

create policy "Owners can view invitations for their screenplays"
  on public.screenplay_invitations for select
  using (
    exists (
      select 1 from public.screenplays s
      where s.id = screenplay_id and s.owner_id = auth.uid()
    )
  );

create policy "Owners can insert invitations for their screenplays"
  on public.screenplay_invitations for insert
  with check (
    exists (
      select 1 from public.screenplays s
      where s.id = screenplay_id and s.owner_id = auth.uid()
    )
  );

create policy "Owners can delete invitations for their screenplays"
  on public.screenplay_invitations for delete
  using (
    exists (
      select 1 from public.screenplays s
      where s.id = screenplay_id and s.owner_id = auth.uid()
    )
  );

-- 2. Updated add_screenplay_user_by_email: returns 'added' or 'invited'
create or replace function public.add_screenplay_user_by_email(
  p_screenplay_id uuid,
  p_email text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_target_id uuid;
  v_normalized_email text := lower(trim(p_email));
begin
  select owner_id into v_owner_id
  from public.screenplays
  where id = p_screenplay_id;

  if v_owner_id is null then
    raise exception 'Screenplay not found';
  end if;
  if v_owner_id != auth.uid() then
    raise exception 'Not the owner of this screenplay';
  end if;

  select id into v_target_id
  from auth.users
  where lower(email) = v_normalized_email
  limit 1;

  if v_target_id is not null then
    insert into public.screenplay_access (screenplay_id, user_id, current_dialogue_index, current_segment_index)
    values (p_screenplay_id, v_target_id, 0, 0)
    on conflict (screenplay_id, user_id) do nothing;
    return 'added';
  end if;

  insert into public.screenplay_invitations (screenplay_id, email, invited_by)
  values (p_screenplay_id, v_normalized_email, auth.uid())
  on conflict (screenplay_id, email) do nothing;
  return 'invited';
end;
$$;

-- 3. Trigger: convert pending invitations when a new user signs up
create or replace function public.convert_invitations_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.screenplay_access (screenplay_id, user_id, current_dialogue_index, current_segment_index)
  select i.screenplay_id, new.id, 0, 0
  from public.screenplay_invitations i
  where lower(i.email) = lower(new.email)
  on conflict (screenplay_id, user_id) do nothing;

  delete from public.screenplay_invitations
  where lower(email) = lower(new.email);

  return new;
end;
$$;

create trigger on_auth_user_created_convert_invitations
  after insert on auth.users
  for each row execute function public.convert_invitations_on_signup();

-- 4. List pending invitations for a screenplay (owner only)
create or replace function public.get_screenplay_invitations(p_screenplay_id uuid)
returns table (email text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
begin
  select owner_id into v_owner_id
  from public.screenplays
  where id = p_screenplay_id;

  if v_owner_id is null then
    raise exception 'Screenplay not found';
  end if;
  if v_owner_id != auth.uid() then
    raise exception 'Not the owner of this screenplay';
  end if;

  return query
  select i.email, i.created_at
  from public.screenplay_invitations i
  where i.screenplay_id = p_screenplay_id
  order by i.created_at;
end;
$$;
