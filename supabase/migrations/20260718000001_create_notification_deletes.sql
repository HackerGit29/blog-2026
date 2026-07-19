-- Notification deletion tracking table
-- Allows soft-deletion of notifications by user while keeping audit trail
-- Audit trail persists independently of notification lifecycle

create table notification_deletes (
  user_id uuid references auth.users(id) on delete cascade,
  notification_id uuid,
  deleted_at timestamptz default now(),
  primary key (user_id, notification_id)
);

-- Index for efficient querying of deleted notifications per user
create index idx_notification_deletes_user on notification_deletes(user_id);

-- Index for cleanup queries (finding old deletions)
create index idx_notification_deletes_deleted_at on notification_deletes(deleted_at);

-- Enable Row Level Security
alter table notification_deletes enable row level security;

-- Users can insert their own deletion records (soft-delete)
create policy "Users insert own notification deletes"
  on notification_deletes
  for insert with check (auth.uid() = user_id);

-- Users can delete their own deletion records (restore)
create policy "Users delete own notification deletes"
  on notification_deletes
  for delete using (auth.uid() = user_id);

-- Users can read their own deletion records (for UI display)
create policy "Users read own notification deletes"
  on notification_deletes
  for select using (auth.uid() = user_id);