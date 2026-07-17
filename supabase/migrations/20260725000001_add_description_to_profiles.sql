-- Add description and created_at columns to user_profiles
alter table user_profiles add column if not exists description text default '';
alter table user_profiles add column if not exists created_at timestamptz default now();

-- Update the view to include new columns
drop view if exists user_profiles_with_formatted_followers;
create or replace view user_profiles_with_formatted_followers as
select
  id,
  user_id,
  name,
  title,
  location,
  description,
  avatar_url,
  socials,
  followers,
  following,
  likes,
  username,
  follower_count,
  format_follower_count(follower_count) as formatted_followers,
  is_verified,
  created_at,
  updated_at
from user_profiles;

grant select on user_profiles_with_formatted_followers to anon, authenticated;

-- Add description and created_at columns to user_profiles
alter table user_profiles add column if not exists description text default '';
alter table user_profiles add column if not exists created_at timestamptz default now();

-- Update the view to include new columns
drop view if exists user_profiles_with_formatted_followers;
create or replace view user_profiles_with_formatted_followers as
select
  id,
  user_id,
  name,
  title,
  location,
  description,
  avatar_url,
  socials,
  followers,
  following,
  likes,
  username,
  follower_count,
  format_follower_count(follower_count) as formatted_followers,
  is_verified,
  created_at,
  updated_at
from user_profiles;

grant select on user_profiles_with_formatted_followers to anon, authenticated;
