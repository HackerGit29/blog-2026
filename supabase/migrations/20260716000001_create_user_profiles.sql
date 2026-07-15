create table user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  title text,
  location text,
  avatar_url text,
  socials jsonb default '{"discord":"","github":"","instagram":""}',
  followers text default '0',
  following text default '0',
  likes text default '0',
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table user_profiles enable row level security;

create policy "Users can read own profile" on user_profiles
  for select using (auth.uid() = user_id);

create policy "Users can upsert own profile" on user_profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" on user_profiles
  for update using (auth.uid() = user_id);

-- Storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Users can upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
