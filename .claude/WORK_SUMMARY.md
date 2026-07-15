# Blog 2026 - Work Summary

## Objective
Build and deploy a React blog on Cloudflare Pages with Supabase backend, auth/admin dashboard, server-side pagination, Microsoft Community Skilling content loop, and SEO.

## Important Details
- Runtime: npm (Node 24). 372 packages, 0 vulnerabilities.
- Domain: benji-aka-dev.site — Cloudflare zone active, registrar Namecheap. DNS still points to old host (A record @ → 162.255.119.221), not yet proxied to Pages.
- GitHub repo: github.com/HackerGit29/blog-2026 (branch: main).
- Cloudflare Pages project: blog-2026 (production branch: main).
- Supabase project: qiqccehbbsslxzlbmmlp.
- Supabase migrations pushed: 20260714000001 (tables + RLS), 20260714000002 (article_list view + GIN indexes), 20260715000001 (user_roles table), 20260715000002 (insert admin role).
- Turnstile sitekey: 0x4AAAAAAD10et5uchjVro4L, secret set as Cloudflare Pages secret (TURNSTILE_SECRET).
- Secrets set in Cloudflare Pages (production): SUPABASE_URL, SUPABASE_ANON_KEY, TURNSTILE_SECRET.
- Dark mode default, theme defined in src/app/providers.tsx (primary green, background paper beige).

## Work State
### Completed
- TurnstileWidget rewritten: useRef + turnstile.ready(), stable container ID removed, async/defer removed from script tag, render=explicit in URL.
- Favicon: replaced SVG with .ico as primary, removed favicon.svg, updated public/_headers + SEOHead default image.
- SQL migration #2 pushed: article_list view, GIN trigram indexes on title/summary, partial index on published_at WHERE is_published.
- Server-side pagination API: functions/api/articles.ts (page, per_page, search, category_id, media_type, returns total, total_all, category_counts).
- useBlogArticles hook refactored: calls /api/articles instead of direct Supabase.
- Blog.tsx refactored: MUI Pagination component, page state, category_counts from API, totalAll for sidebar widget.
- Full README written: architecture, stack, structure, routes, API, DB, security, SEO, dev setup, deploy.
- Microsoft Community Skilling content: src/lib/microsoft/content.ts (8 tech definitions + generateArticleHtml), src/components/blog/MicrosoftBanners.tsx (Reactor + Community Skilling banners), integrated into BlogArticle.tsx (banners appear for matching slugs).
- SQL migration #3 pushed: user_roles table with RLS (users read own role, admins manage all).
- BlockNote installed: @blocknote/core, @blocknote/mantine, @blocknote/react.
- Auth system: useAuth.ts (email/password signin/signup/signout, session persistence), useRole.ts (admin check), AuthGuard.tsx, AdminGuard.tsx.
- Login page: src/pages/auth/Login.tsx (MUI dark theme, email/password, toggle register/login, redirect /admin).
- Admin layout: AdminLayout.tsx (sidebar: Dashboard, Articles, Vidéos, Community, Paramètres, Déconnexion).
- Admin pages: Dashboard.tsx (stats + SEO overview), ArticleManager.tsx (full CRUD + BlockEditor), AdminVideos.tsx (video grid), AdminCommunity.tsx (newsletter subscribers), AdminSettings.tsx (social links).
- BlockEditor: src/components/admin/BlockEditor.tsx (BlockNote, dark/light theme adapts to MUI).
- Routes updated: /login → Login, /admin/* → AdminLayout with guards.
- SQL migration #4 (seed): admin user role inserted (uid=b329b877-bff0-47ae-8dac-c6c128000424).
- Build & deploy v1.9 successful (last deploy hash: ac97e4bd).

### Blocked
- Custom domain benji-aka-dev.site not yet active on Pages (DNS still points to old host).
- Search Console site not yet added/verified.

## Next Move
1. User: go to Cloudflare Dashboard → DNS → delete A record @, add CNAME @ → blog-2026-26y.pages.dev (proxied).
2. Then: modify www CNAME from parkingpage.namecheap.com to benji-aka-dev.site (proxied).
3. Then: verify custom domain in Pages → Custom domains → becomes "Actif".
4. After domain active: submit sitemap via Search Console API.

## Relevant Files
- src/hooks/useAuth.ts : auth hook (email/password, session)
- src/hooks/useRole.ts : role check via user_roles table
- src/components/auth/AuthGuard.tsx : redirects /login if not authenticated
- src/components/auth/AdminGuard.tsx : redirects / if not admin
- src/pages/auth/Login.tsx : login/register form (dark MUI)
- src/pages/admin/AdminLayout.tsx : sidebar + Outlet
- src/pages/admin/Dashboard.tsx : stats + SEO overview
- src/pages/admin/ArticleManager.tsx : CRUD + BlockEditor
- src/pages/admin/AdminVideos.tsx : video gallery
- src/pages/admin/AdminCommunity.tsx : subscriber list
- src/pages/admin/AdminSettings.tsx : social links
- src/components/admin/BlockEditor.tsx : BlockNote integration
- src/lib/microsoft/content.ts : MS tech data + generateArticleHtml
- src/components/blog/MicrosoftBanners.tsx : Reactor + Community Skilling banners
- src/app/routes.tsx : all routes with guards
- supabase/migrations/20260715000001_create_user_roles.sql : auth migration
- supabase/migrations/20260715000002_seed_admin_role.sql : admin seed
- .env : VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_TURNSTILE_SITEKEY
