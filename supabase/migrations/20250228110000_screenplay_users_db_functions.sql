-- Manage screenplay users via DB (no Edge Function).
-- Owner can add/remove users; list returns users with emails from auth.users.

-- RLS: owner can insert/delete access for any user on their screenplay
drop policy if exists "Users can insert own access" on public.screenplay_access;
drop policy if exists "Users can delete own access" on public.screenplay_access;

create policy "Users can insert own access"
  on public.screenplay_access for insert
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.screenplays s
      where s.id = screenplay_id and s.owner_id = auth.uid()
    )
  );

create policy "Users can delete own access"
  on public.screenplay_access for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.screenplays s
      where s.id = screenplay_id and s.owner_id = auth.uid()
    )
  );

-- Add user by email (owner only). Looks up auth.users, inserts screenplay_access.
create or replace function public.add_screenplay_user_by_email(
  p_screenplay_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_target_id uuid;
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
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_target_id is null then
    raise exception 'User not found with that email';
  end if;

  insert into public.screenplay_access (screenplay_id, user_id, current_dialogue_index, current_segment_index)
  values (p_screenplay_id, v_target_id, 0, 0)
  on conflict (screenplay_id, user_id) do nothing;
end;
$$;

-- List users with access (owner only). Returns user_id, email, character_role.
create or replace function public.get_screenplay_users(p_screenplay_id uuid)
returns table (user_id uuid, email text, character_role text)
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
  select a.user_id, u.email::text, a.character_role
  from public.screenplay_access a
  join auth.users u on u.id = a.user_id
  where a.screenplay_id = p_screenplay_id;
end;
$$;
