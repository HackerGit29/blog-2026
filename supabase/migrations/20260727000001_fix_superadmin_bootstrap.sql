-- Migration: Fix superadmin bootstrapping
-- Ensures admin@akadev.site gets superadmin role regardless of when they signed up.
-- Previously, grant_superadmin('admin@akadev.site') was called at migration time.
-- If the user hadn't signed up yet, the function raised an exception and the
-- migration transaction rolled back, leaving the DB without the helper functions.
-- This migration:
--   1. Recreates helper functions idempotently (in case earlier ones were rolled back)
--   2. Grants superadmin inside a DO block that never fails

-- 1. Recreate helper function (idempotent)
create or replace function get_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from auth.users where email = p_email limit 1;
$$;

revoke all on function get_user_id_by_email(text) from public;
grant execute on function get_user_id_by_email(text) to authenticated;

-- 2. Recreate grant_superadmin (idempotent)
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

  alter table user_profiles disable trigger tr_protect_profile_fields;
  update user_profiles set is_verified = true where user_id = v_user_id;
  alter table user_profiles enable trigger tr_protect_profile_fields;

  -- Claim the 'mopaossi' username: clear any orphaned seed row first
  delete from user_profiles
  where username = 'mopaossi'
    and user_id <> v_user_id
    and not exists (select 1 from auth.users where id = user_profiles.user_id);

  -- Transfer username to the real user
  update user_profiles set username = 'mopaossi' where user_id = v_user_id;

  insert into user_roles (user_id, role) values (v_user_id, 'superadmin')
    on conflict (user_id) do update set role = 'superadmin';

  update admin_articles set author_id = v_user_id where author_id is null or author_id <> v_user_id;
  update messages      set author_id = v_user_id where author_id is null or author_id <> v_user_id;
  update notifications set author_id = v_user_id where author_id is null or author_id <> v_user_id;
end;
$$;

revoke all on function grant_superadmin(text) from public;
grant execute on function grant_superadmin(text) to authenticated;

-- 3. Grant superadmin — fails silently if user hasn't signed up yet
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'admin@akadev.site';

  if v_user_id is not null then
    insert into user_profiles (user_id) values (v_user_id) on conflict (user_id) do nothing;

    alter table user_profiles disable trigger tr_protect_profile_fields;
    update user_profiles set is_verified = true where user_id = v_user_id;
    alter table user_profiles enable trigger tr_protect_profile_fields;

    -- Claim the 'mopaossi' username: clear any orphaned seed row first
    delete from user_profiles
    where username = 'mopaossi'
      and user_id <> v_user_id
      and not exists (select 1 from auth.users where id = user_profiles.user_id);

    -- Transfer username to the real user
    update user_profiles set username = 'mopaossi' where user_id = v_user_id;

    insert into user_roles (user_id, role) values (v_user_id, 'superadmin')
      on conflict (user_id) do update set role = 'superadmin';

    update admin_articles set author_id = v_user_id where author_id is null or author_id <> v_user_id;
    update messages      set author_id = v_user_id where author_id is null or author_id <> v_user_id;
    update notifications set author_id = v_user_id where author_id is null or author_id <> v_user_id;
  end if;
end;
$$;
