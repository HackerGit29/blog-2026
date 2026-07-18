-- Migration: Recreate super admin auth user with valid bcrypt hash
-- pgcrypto must be called via extensions schema

do $$
declare
  v_hash text;
  v_user_id uuid := gen_random_uuid();
begin
  -- Generate a proper bcrypt hash (compatible with Supabase Auth's GoTrue)
  v_hash := extensions.crypt('Sup3rAdmin2026!', extensions.gen_salt('bf'));

  -- Clean slate
  delete from auth.users where email = 'sa@akadev.site';
  delete from user_profiles where username = 'super-admin';

  -- Create auth user with generated hash + email confirmed
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, raw_app_meta_data, raw_user_meta_data)
  values (
    v_user_id,
    'sa@akadev.site',
    v_hash,
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{}'
  );

  -- Create admin profile
  insert into user_profiles (user_id, username, name, can_access_admin)
  values (v_user_id, 'super-admin', 'Super Admin', true);
end;
$$;
