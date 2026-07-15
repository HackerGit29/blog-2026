-- Migration: Fix user_roles RLS — restore read access for own role
-- The 20260720000003 migration replaced all policies with a superadmin-only
-- "for all" policy, which blocked regular admins from even SELECTing their own
-- role. This broke AdminGuard (isAdmin was always false for non-superadmins).

-- 1. Restore: any authenticated user can read their own role
drop policy if exists "Users can read own role" on user_roles;
create policy "Users can read own role" on user_roles
  for select using (auth.uid() = user_id);

-- 2. Keep: only superadmin can manage roles (INSERT/UPDATE/DELETE)
-- The existing "Superadmins can manage roles" policy (for all using is_superadmin())
-- already covers this. But "for all" also applies to SELECT, which conflicts
-- with the policy above. We drop and recreate with explicit command scope.
drop policy if exists "Superadmins can manage roles" on user_roles;
create policy "Superadmins can manage roles" on user_roles
  for insert with check (is_superadmin());

create policy "Superadmins can update roles" on user_roles
  for update using (is_superadmin());

create policy "Superadmins can delete roles" on user_roles
  for delete using (is_superadmin());
