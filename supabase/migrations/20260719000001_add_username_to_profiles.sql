-- Migration: Add username column to user_profiles and allow public read of profiles

-- 1. Add username column (initially nullable to allow backfill)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username text;

-- 2. Backfill existing profiles with a slugified username
-- We convert to lowercase, replace non-alphanumeric chars with '-', and clean up hyphens
UPDATE user_profiles
SET username = REGEXP_REPLACE(REGEXP_REPLACE(LOWER(COALESCE(name, 'user-' || SUBSTRING(user_id::text FROM 1 FOR 8))), '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g')
WHERE username IS NULL;

-- 3. In case any backfilled username is null or empty, assign a fallback based on user_id
UPDATE user_profiles
SET username = 'user-' || SUBSTRING(user_id::text FROM 1 FOR 8)
WHERE username IS NULL OR username = '';

-- 4. Add unique constraint to username
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);

-- 5. Enable public read access for user_profiles so public portfolio pages can display them
DROP POLICY IF EXISTS "Anyone can view public profiles" ON user_profiles;
CREATE POLICY "Anyone can view public profiles" ON user_profiles
  FOR SELECT USING (true);
