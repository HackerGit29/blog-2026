create type app_role as enum ('admin', 'moderator', 'user');

create table user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz default now(),
  unique(user_id)
);

alter table user_roles enable row level security;

create policy "Users can read own role" on user_roles
  for select using (auth.uid() = user_id);

create policy "Admins can manage roles" on user_roles
  for all using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );
