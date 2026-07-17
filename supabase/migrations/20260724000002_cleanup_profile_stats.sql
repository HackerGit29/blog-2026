-- Clean up obsolete profile stats columns and add formatter function

-- 1. Drop obsolete columns (followers, following, likes stored as text)
-- We keep them for backward compatibility but mark them as deprecated
-- They will be ignored in favor of the new follower_count system

-- 2. Create function to format follower count Instagram-style
-- Examples: 0, 1, 100, 1.2K, 1.5M, 10M, 100M, 1B
create or replace function format_follower_count(count integer)
returns text as $$
declare
  abs_count integer;
begin
  if count is null then
    return '0';
  end if;

  abs_count := abs(count);

  -- 0-999: show exact number
  if abs_count < 1000 then
    return count::text;
  end if;

  -- 1K-999K: show with K suffix
  if abs_count < 1000000 then
    return (round(count::numeric / 1000, 1))::text || 'K';
  end if;

  -- 1M-999M: show with M suffix
  if abs_count < 1000000000 then
    return (round(count::numeric / 1000000, 1))::text || 'M';
  end if;

  -- 1B+: show with B suffix
  return (round(count::numeric / 1000000000, 1))::text || 'B';
end;
$$ language plpgsql immutable;

-- 3. Create view for formatted follower counts (for easy querying)
create or replace view user_profiles_with_formatted_followers as
select
  id,
  user_id,
  name,
  title,
  location,
  avatar_url,
  socials,
  followers,
  following,
  likes,
  username,
  follower_count,
  format_follower_count(follower_count) as formatted_followers,
  updated_at
from user_profiles;

-- 4. Grant access to the view
grant select on user_profiles_with_formatted_followers to anon, authenticated;
