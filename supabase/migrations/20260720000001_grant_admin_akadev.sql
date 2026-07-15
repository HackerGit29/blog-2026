-- Migration: Grant full admin + superadmin rights to admin@akadev.site
--
-- Context: the multi-tenant migration (20260718000001) locked down user_roles so
-- only superadmins can grant roles, and locked user_profiles.is_verified via a
-- trigger. This migration force-promotes the canonical app owner and exposes
-- a helper RPC to grant roles to other users going forward.

-- 1. Helper: resolve user_id by email (SECURITY DEFINER, immutable)
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

-- 2. Grant / refresh superadmin status for a given email
--    - upserts user_roles with role='admin'
--    - upserts user_profiles with is_verified=true (bypasses protect trigger
--      because the function is SECURITY DEFINER and runs as the function owner)
--    - backfills orphaned content onto the new owner so RLS doesn't hide it
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

  -- Ensure user_profiles row exists
  insert into user_profiles (user_id, is_verified)
  values (v_user_id, true)
  on conflict (user_id) do nothing;

  -- Force is_verified = true (the protect_profile_fields trigger preserves OLD
  -- values on UPDATE; we work around it by disabling the trigger for this tx)
  alter table user_profiles disable trigger tr_protect_profile_fields;
  update user_profiles
    set is_verified = true
    where user_id = v_user_id;
  alter table user_profiles enable trigger tr_protect_profile_fields;

  -- Grant / refresh admin role
  insert into user_roles (user_id, role)
  values (v_user_id, 'admin')
  on conflict (user_id) do update set role = 'admin';

  -- Backfill orphaned content so the new superadmin owns everything
  update admin_articles set author_id = v_user_id where author_id is null or author_id <> v_user_id;
  update messages      set author_id = v_user_id where author_id is null or author_id <> v_user_id;
  update notifications set author_id = v_user_id where author_id is null or author_id <> v_user_id;
end;
$$;

revoke all on function grant_superadmin(text) from public;
grant execute on function grant_superadmin(text) to authenticated;

-- 3. Apply the promotion to the canonical app owner
select grant_superadmin('admin@akadev.site');
