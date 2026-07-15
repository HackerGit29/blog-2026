create type notif_kind as enum ('announcement','event','article','video','message','system');

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  kind notif_kind not null default 'system',
  title text not null,
  body text,
  icon text,
  cta_label text,
  cta_url text,
  cta_target text check (cta_target in ('article','video','external','message','none')) default 'none',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table notification_reads (
  notification_id uuid references notifications(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (notification_id, user_id)
);

create index idx_notif_user on notifications(user_id, created_at desc);
create index idx_notif_reads_user on notification_reads(user_id);

alter table notifications enable row level security;
alter table notification_reads enable row level security;

create policy "Users read own notifs" on notifications
  for select using (auth.uid() = user_id);

create policy "Admins manage notifs" on notifications
  for all using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

create policy "Users insert own notif reads" on notification_reads
  for insert with check (auth.uid() = user_id);

create policy "Users read own notif reads" on notification_reads
  for select using (auth.uid() = user_id);

-- Enable realtime for both notification tables
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table messages;
