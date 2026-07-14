-- Migration: Create all blog tables
create type media_type as enum ('image', 'video');
create type article_status as enum ('draft', 'scheduled', 'published', 'archived');

create table blog_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  color text,
  created_at timestamptz default now()
);

create table admin_articles (
  id uuid default gen_random_uuid() primary key,
  author_id uuid default auth.uid(),
  title text not null,
  slug text not null unique,
  summary text,
  content text,
  image_url text,
  video_url text,
  media_type media_type,
  tags text[] default '{}',
  category_id uuid references blog_categories(id) on delete set null,
  meta_description text,
  reading_time int,
  status article_status default 'draft',
  is_published boolean default false,
  featured_order int,
  published_at timestamptz,
  created_at timestamptz default now()
);

create table newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  source text default 'blog',
  status text default 'active',
  created_at timestamptz default now()
);

-- Indexes
create index idx_admin_articles_slug on admin_articles(slug);
create index idx_admin_articles_status on admin_articles(status);
create index idx_admin_articles_category on admin_articles(category_id);
create index idx_admin_articles_published_at on admin_articles(published_at desc);
create index idx_newsletter_subscribers_email on newsletter_subscribers(email);

-- Row Level Security
alter table blog_categories enable row level security;
alter table admin_articles enable row level security;
alter table newsletter_subscribers enable row level security;

-- Public read for categories
create policy "Public read categories" on blog_categories
  for select using (true);

-- Public read for published articles
create policy "Public read published articles" on admin_articles
  for select using (status = 'published');

-- Anyone can insert newsletter (for public form)
create policy "Public insert newsletter" on newsletter_subscribers
  for insert with check (true);
