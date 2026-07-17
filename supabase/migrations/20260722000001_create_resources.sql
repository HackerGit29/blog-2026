create table if not exists tenant_resources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  url text not null,
  category text not null default 'learn',
  icon text default 'link',
  sort_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_resources_user_id on tenant_resources(user_id);
create index if not exists idx_resources_category on tenant_resources(category);

alter table tenant_resources enable row level security;

-- Public can see visible resources
create policy "Public view visible resources"
  on tenant_resources for select
  using (is_visible = true);

-- Owner manages their resources
create policy "Owner manage resources"
  on tenant_resources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
