-- Allow regular users to insert notifications for themselves
-- (needed for auto welcome / profile prompts on login)
drop policy if exists "Users insert own notifs" on notifications;
create policy "Users insert own notifs" on notifications
  for insert with check (
    not is_banned() and auth.uid() = user_id
  );
