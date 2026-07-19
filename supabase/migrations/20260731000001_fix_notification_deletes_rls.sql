-- Fix RLS policies for notification_deletes table
-- Adds admin management policies for the notification_deletes table
-- so admins can view and clean up soft-delete records

-- Policy for admins to select all notification deletion records
-- (for admin panel visibility and audit)
create policy "Admins select all notification deletes"
  on notification_deletes
  for select using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Policy for admins to delete notification deletes
-- (for manual cleanup and maintenance via admin panel)
create policy "Admins delete notification deletes"
  on notification_deletes
  for delete using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );
