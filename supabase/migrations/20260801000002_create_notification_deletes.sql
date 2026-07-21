create table if not exists notification_deletes (
  user_id uuid references auth.users(id) on delete cascade,
  notification_id uuid,
  deleted_at timestamptz default now(),
  primary key (user_id, notification_id)
);

create index if not exists idx_notification_deletes_user on notification_deletes(user_id);
create index if not exists idx_notification_deletes_deleted_at on notification_deletes(deleted_at);

alter table notification_deletes enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users insert own notification deletes') then
    create policy "Users insert own notification deletes" on notification_deletes
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users delete own notification deletes') then
    create policy "Users delete own notification deletes" on notification_deletes
      for delete using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users read own notification deletes') then
    create policy "Users read own notification deletes" on notification_deletes
      for select using (auth.uid() = user_id);
  end if;
end $$;
