-- Create followers system with denormalized follower count for performance
-- This replaces the text-based followers/following fields with a proper relational model

-- 1. Create followers table (who follows whom)
create table followers (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

-- 2. Create indexes for fast lookups
create index idx_followers_follower_id on followers(follower_id);
create index idx_followers_following_id on followers(following_id);
create index idx_followers_created_at on followers(created_at desc);

-- 3. Add follower_count column to user_profiles (denormalized for performance)
alter table user_profiles add column if not exists follower_count integer default 0;

-- 4. Enable RLS on followers table
alter table followers enable row level security;

-- 5. RLS Policies for followers table
-- Public can read follower relationships
create policy "Public read followers" on followers
  for select using (true);

-- Authenticated users can follow/unfollow
create policy "Users can follow" on followers
  for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow" on followers
  for delete using (auth.uid() = follower_id);

-- 6. Create function to update follower count (trigger)
create or replace function update_follower_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update user_profiles
    set follower_count = follower_count + 1
    where user_id = new.following_id;
    return new;
  elsif tg_op = 'DELETE' then
    update user_profiles
    set follower_count = follower_count - 1
    where user_id = old.following_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

-- 7. Create trigger to automatically update follower count
create trigger trigger_update_follower_count
after insert or delete on followers
for each row
execute function update_follower_count();

-- 8. Backfill follower_count from existing followers
update user_profiles
set follower_count = (
  select count(*) from followers where followers.following_id = user_profiles.user_id
);
