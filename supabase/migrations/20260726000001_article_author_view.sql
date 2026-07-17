-- Migration: expose author info in article_list, rename admin profile to Benji
-- 1. Rename admin profile to "Benji" (display name) — username stays mopaossi
UPDATE user_profiles
SET name = 'Benji',
    updated_at = now()
WHERE user_id = 'b329b877-bff0-47ae-8dac-c6c128000424';

-- 2. Backfill any remaining NULL author_id on admin_articles to admin user
UPDATE admin_articles
SET author_id = 'b329b877-bff0-47ae-8dac-c6c128000424'
WHERE author_id IS NULL;

-- 3. Recreate article_list view with author join (idempotent)
DROP VIEW IF EXISTS article_list;
CREATE VIEW article_list AS
SELECT
  a.id,
  a.title,
  a.slug,
  a.summary,
  a.image_url,
  a.video_url,
  a.media_type,
  a.tags,
  a.category_id,
  a.reading_time,
  a.featured_order,
  a.published_at,
  a.created_at,
  a.author_id,
  to_jsonb(c.*) AS category,
  jsonb_build_object(
    'user_id', p.user_id,
    'username', p.username,
    'name', p.name,
    'avatar_url', p.avatar_url
  ) AS author
FROM admin_articles a
LEFT JOIN blog_categories c ON c.id = a.category_id
LEFT JOIN user_profiles p ON p.user_id = a.author_id
WHERE a.is_published = true;
