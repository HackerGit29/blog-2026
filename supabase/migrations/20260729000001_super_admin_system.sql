-- Migration: Super admin system
-- Adds a can_access_admin flag and creates the super admin user.
-- The super admin can grant/revoke /admin access to other users.

-- 1. Add can_access_admin column
alter table user_profiles add column if not exists can_access_admin boolean not null default false;

-- 2. Helper: check if current user is an admin
create or replace function is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from user_profiles
    where user_id = auth.uid() and can_access_admin = true
  );
$$;

grant execute on function is_admin_user() to authenticated;

-- 3. Update user_profiles RLS: admin users can manage all profiles
-- (existing self-read/update policies remain, this adds admin override)
drop policy if exists "Admins can manage all profiles" on user_profiles;
create policy "Admins can manage all profiles" on user_profiles
  for all using (is_admin_user());

-- 4. Create the super admin auth user
do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_hash text;
begin
  v_hash := extensions.crypt('Sup3rAdmin2026!', extensions.gen_salt('bf'));
  if not exists (select 1 from auth.users where email = 'sa@akadev.site') then
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, raw_app_meta_data, raw_user_meta_data)
    values (v_user_id, 'sa@akadev.site', v_hash, now(), now(), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}');

    -- Seed admin profile
    insert into user_profiles (user_id, username, name, can_access_admin)
    values (v_user_id, 'super-admin', 'Super Admin', true)
    on conflict (user_id) do update set can_access_admin = true;
  end if;
end;
$$;
