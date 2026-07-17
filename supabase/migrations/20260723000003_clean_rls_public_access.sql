-- Clean RLS policies to allow public access to all public content
-- Visitors (non-authenticated) can read all published/visible content
-- Only authenticated users can write/manage their own data

-- ── messages table ──────────────────────────────────────────────
-- Change: Allow public read of sent messages (not just authenticated)
DROP POLICY IF EXISTS "Authenticated read sent messages" ON messages;
CREATE POLICY "Public read sent messages" ON messages
  FOR SELECT USING (status = 'sent');

-- Keep: Admins manage messages
-- (existing policy is fine)

-- ── message_reads table ─────────────────────────────────────────
-- Keep: Users can only read/insert their own message reads
-- (existing policies are fine)

-- ── notifications table ─────────────────────────────────────────
-- Keep: Users can only read their own notifications
-- (existing policies are fine - notifications are private by design)

-- ── notification_reads table ────────────────────────────────────
-- Keep: Users can only read/insert their own notification reads
-- (existing policies are fine)

-- ── admin_articles table ────────────────────────────────────────
-- Already correct: Public read published articles
-- (no changes needed)

-- ── blog_categories table ───────────────────────────────────────
-- Already correct: Public read categories
-- (no changes needed)

-- ── user_profiles table ─────────────────────────────────────────
-- Already correct: Public read profiles
-- (no changes needed)

-- ── tenant_resources table ──────────────────────────────────────
-- Already correct: Public read visible resources
-- (no changes needed)

-- ── newsletter_subscribers table ────────────────────────────────
-- Already correct: Public insert newsletter
-- (no changes needed)

-- ── user_roles table ────────────────────────────────────────────
-- Keep: Users can read own role, superadmins manage
-- (existing policies are fine - internal table)
