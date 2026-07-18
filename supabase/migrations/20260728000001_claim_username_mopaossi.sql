-- Migration: Claim 'mopaossi' username for the real superadmin user
-- The 20260727000001 migration granted superadmin role but did NOT set
-- the user_profiles.username to 'mopaossi'. The seed profile row (UUID
-- b329b877-bff0-47ae-8dac-c6c128000424) still holds the username, but
-- its auth.users entry doesn't exist, so the real user can't claim it.
-- This migration:
--   1. Updates grant_superadmin() to also transfer the username
--   2. Re-runs the grant against admin@akadev.site
--   3. Also fixes any existing superadmin users who lack the tenant username

-- 1. Recreate grant_superadmin with username claim logic
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

  delete from user_profiles
  where username = 'mopaossi'
    and user_id <> v_user_id
    and not exists (select 1 from auth.users where id = user_profiles.user_id);

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

-- 2. Apply: grant admin@akadev.site + transfer username
select grant_superadmin('admin@akadev.site');

-- 3. Safety net: fix any existing superadmin who still lacks the tenant username
do $$
declare
  rec record;
begin
  for rec in
    select ur.user_id
    from user_roles ur
    where ur.role = 'superadmin'
      and not exists (
        select 1 from user_profiles up
        where up.user_id = ur.user_id and up.username = 'mopaossi'
      )
  loop
    delete from user_profiles
    where username = 'mopaossi'
      and user_id <> rec.user_id
      and not exists (select 1 from auth.users where id = user_profiles.user_id);

    update user_profiles set username = 'mopaossi' where user_id = rec.user_id;
  end loop;
end;
$$;
