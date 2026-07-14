create extension if not exists pg_trgm;

create view article_list as
select
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
  to_jsonb(c.*) as category
from admin_articles a
left join blog_categories c on c.id = a.category_id
where a.is_published = true;

create index idx_admin_articles_title_trgm on admin_articles using gin (title gin_trgm_ops);
create index idx_admin_articles_summary_trgm on admin_articles using gin (summary gin_trgm_ops);
create index idx_admin_articles_published_list on admin_articles (published_at desc) where is_published = true;
