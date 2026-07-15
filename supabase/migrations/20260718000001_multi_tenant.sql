-- Migration: Multi-tenant database schema & policies

-- 1. Update user_profiles to add is_verified
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- 2. Update notifications to add author_id
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- 3. Backfill existing records to default admin if needed
UPDATE admin_articles SET author_id = 'b329b877-bff0-47ae-8dac-c6c128000424' WHERE author_id IS NULL;
UPDATE messages SET author_id = 'b329b877-bff0-47ae-8dac-c6c128000424' WHERE author_id IS NULL;
UPDATE notifications SET author_id = 'b329b877-bff0-47ae-8dac-c6c128000424' WHERE author_id IS NULL;

-- 4. Create trigger to protect user_profiles statistics and verified badge
CREATE OR REPLACE FUNCTION protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If executed by service_role, allow anything
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- On insert, default these fields to initial values
  IF TG_OP = 'INSERT' THEN
    NEW.is_verified := false;
    NEW.followers := '0';
    NEW.following := '0';
    NEW.likes := '0';
  -- On update, preserve old values
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.is_verified := OLD.is_verified;
    NEW.followers := OLD.followers;
    NEW.following := OLD.following;
    NEW.likes := OLD.likes;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_fields ON user_profiles;
CREATE TRIGGER tr_protect_profile_fields
BEFORE INSERT OR UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION protect_profile_fields();

-- 5. Row Level Security Policies for admin_articles
DROP POLICY IF EXISTS "Admins select own articles" ON admin_articles;
CREATE POLICY "Admins select own articles" ON admin_articles
  FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins insert own articles" ON admin_articles;
CREATE POLICY "Admins insert own articles" ON admin_articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins update own articles" ON admin_articles;
CREATE POLICY "Admins update own articles" ON admin_articles
  FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins delete own articles" ON admin_articles;
CREATE POLICY "Admins delete own articles" ON admin_articles
  FOR DELETE USING (auth.uid() = author_id);

-- 6. Row Level Security Policies for blog_categories (shared global)
DROP POLICY IF EXISTS "Admins manage categories" ON blog_categories;
CREATE POLICY "Admins manage categories" ON blog_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- 7. Row Level Security Policies for messages
DROP POLICY IF EXISTS "Admins manage messages" ON messages;
DROP POLICY IF EXISTS "Admins manage own messages" ON messages;
CREATE POLICY "Admins manage own messages" ON messages
  FOR ALL USING (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- 8. Row Level Security Policies for notifications
DROP POLICY IF EXISTS "Admins manage notifs" ON notifications;
DROP POLICY IF EXISTS "Admins manage own notifs" ON notifications;
CREATE POLICY "Admins manage own notifs" ON notifications
  FOR ALL USING (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- 9. Row Level Security Policies for user_roles (restricted to superadmin or service_role)
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Superadmins can manage roles" ON user_roles;
CREATE POLICY "Superadmins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles r
      JOIN user_profiles p ON p.user_id = r.user_id
      WHERE r.user_id = auth.uid() AND r.role = 'admin' AND p.is_verified = true
    )
  );
