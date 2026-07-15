-- In-app messages (newsletter source of truth)
create table messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  body text not null,
  cover_url text,
  cta_label text,
  cta_url text,
  cta_target text check (cta_target in ('article','video','external','message','none')) default 'none',
  status text default 'draft' check (status in ('draft','scheduled','sent')),
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table message_reads (
  message_id uuid references messages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (message_id, user_id)
);

create index idx_messages_status on messages(status, sent_at desc);
create index idx_message_reads_user on message_reads(user_id);

alter table messages enable row level security;
alter table message_reads enable row level security;

create policy "Authenticated read sent messages" on messages
  for select using (auth.role() = 'authenticated' and status = 'sent');

create policy "Admins manage messages" on messages
  for all using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

create policy "Users insert own message reads" on message_reads
  for insert with check (auth.uid() = user_id);

create policy "Users read own message reads" on message_reads
  for select using (auth.uid() = user_id);
