-- Migration: Role hierarchy + ban system
-- Depends on: 20260720000002 (superadmin enum value added)

-- 1. is_banned on user_profiles
alter table user_profiles add column if not exists is_banned boolean not null default false;

-- 2. Updated grant_superadmin: assigns 'superadmin' role to the canonical owner
create or replace function grant_superadmin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := get_user_id_by_email(p_email);
  if v_user_id is null then
    raise exception 'No auth.users row found for email %', p_email;
  end if;

  insert into user_profiles (user_id) values (v_user_id) on conflict (user_id) do nothing;

  -- Bypass protect_profile_fields trigger to set is_verified = true
  alter table user_profiles disable trigger tr_protect_profile_fields;
  update user_profiles set is_verified = true where user_id = v_user_id;
  alter table user_profiles enable trigger tr_protect_profile_fields;

  -- Promote to 'superadmin' (separate from 'admin')
  insert into user_roles (user_id, role) values (v_user_id, 'superadmin')
    on conflict (user_id) do update set role = 'superadmin';

  -- Backfill orphaned content so the superadmin owns everything
  update admin_articles set author_id = v_user_id where author_id is null or author_id <> v_user_id;
  update messages      set author_id = v_user_id where author_id is null or author_id <> v_user_id;
  update notifications set author_id = v_user_id where author_id is null or author_id <> v_user_id;
end;
$$;

-- 3. Helper: current user is superadmin (used inside RLS policies)
create or replace function is_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'superadmin'
  );
$$;

grant execute on function is_superadmin() to authenticated;

-- 4. Helper: current user is banned
create or replace function is_banned()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_banned from user_profiles where user_id = auth.uid()),
    false
  );
$$;

grant execute on function is_banned() to authenticated;

-- 5. RLS: superadmin can manage all content, banned blocked from all
-- admin_articles
drop policy if exists "Admins select own articles" on admin_articles;
create policy "Admins select own articles" on admin_articles
  for select using (
    not is_banned() and (auth.uid() = author_id or is_superadmin())
  );

drop policy if exists "Admins insert own articles" on admin_articles;
create policy "Admins insert own articles" on admin_articles
  for insert with check (
    not is_banned() and (auth.uid() = author_id or is_superadmin())
  );

drop policy if exists "Admins update own articles" on admin_articles;
create policy "Admins update own articles" on admin_articles
  for update using (
    not is_banned() and (auth.uid() = author_id or is_superadmin())
  ) with check (
    not is_banned() and (auth.uid() = author_id or is_superadmin())
  );

drop policy if exists "Admins delete own articles" on admin_articles;
create policy "Admins delete own articles" on admin_articles
  for delete using (
    not is_banned() and (auth.uid() = author_id or is_superadmin())
  );

-- blog_categories
drop policy if exists "Admins manage categories" on blog_categories;
create policy "Admins manage categories" on blog_categories
  for all using (
    not is_banned() and (
      is_superadmin() or exists (
        select 1 from user_roles
        where user_id = auth.uid() and role = 'admin'
      )
    )
  );

-- messages
drop policy if exists "Admins manage own messages" on messages;
drop policy if exists "Admins manage messages" on messages;
create policy "Admins manage messages" on messages
  for all using (
    not is_banned() and (
      is_superadmin() or (
        auth.uid() = author_id and exists (
          select 1 from user_roles
          where user_id = auth.uid() and role in ('admin', 'superadmin')
        )
      )
    )
  );

-- notifications
drop policy if exists "Admins manage own notifs" on notifications;
drop policy if exists "Admins manage notifs" on notifications;
create policy "Admins manage notifications" on notifications
  for all using (
    not is_banned() and (
      is_superadmin() or (
        auth.uid() = author_id and exists (
          select 1 from user_roles
          where user_id = auth.uid() and role in ('admin', 'superadmin')
        )
      )
    )
  );

-- 6. user_profiles: users read own, superadmin reads/writes all, banned blocked
drop policy if exists "Users can read own profile" on user_profiles;
create policy "Users can read own profile" on user_profiles
  for select using (
    auth.uid() = user_id or is_superadmin()
  );

drop policy if exists "Users can upsert own profile" on user_profiles;
create policy "Users can upsert own profile" on user_profiles
  for insert with check (
    not is_banned() and auth.uid() = user_id
  );

drop policy if exists "Users can update own profile" on user_profiles;
create policy "Users can update own profile" on user_profiles
  for update using (
    not is_banned() and (auth.uid() = user_id or is_superadmin())
  );

-- 7. user_roles: only superadmin can manage
drop policy if exists "Superadmins can manage roles" on user_roles;
create policy "Superadmins can manage roles" on user_roles
  for all using (is_superadmin());

-- 8. Apply: ensure admin@akadev.site is superadmin
select grant_superadmin('admin@akadev.site');
