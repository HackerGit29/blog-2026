-- Migration: Tenant resources → JSONB bundle
-- Avant : 1 ligne par ressource. Après : 1 ligne par tenant, ressources en JSONB.

create table if not exists tenant_resources_bundle (
  user_id uuid primary key references auth.users(id) on delete cascade,
  resources jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

insert into tenant_resources_bundle (user_id, resources, updated_at)
select
  user_id,
  jsonb_agg(
    jsonb_build_object(
      'title', title,
      'description', description,
      'url', url,
      'category', category,
      'icon', icon,
      'sort_order', sort_order
    )
    order by sort_order
  ),
  now()
from tenant_resources
where is_visible = true
group by user_id;

alter table tenant_resources_bundle enable row level security;

create policy "Public read resources bundle"
  on tenant_resources_bundle for select
  using (true);

create policy "Owner manage resources bundle"
  on tenant_resources_bundle for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop table if exists tenant_resources;
