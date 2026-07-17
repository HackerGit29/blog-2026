# Blog — Agent Instructions

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server on `0.0.0.0:3000` |
| `npm run lint` | `tsc --noEmit` (only typecheck, no linter) |
| `npm run build` | `vite build` → `dist/` |
| `npm run clean` | `rm -rf dist server.js` |
| `supabase db push` | Apply Supabase migrations |
| `supabase gen types typescript --linked > src/integrations/supabase/types.ts` | Regenerate DB types |
| `npx wrangler pages deploy dist --project-name blog-2026 --branch main` | Deploy to Cloudflare Pages |

No test framework configured.

## Deploy

Deployment uses Wrangler (Cloudflare CLI). If `npx` hangs, use the full path:
```
rtk C:\Users\paoss\AppData\Roaming\npm\npx.cmd --yes wrangler@4.110.0 pages deploy dist --project-name blog-2026 --branch main
```

## MUI v9

Props must be in `sx` — `fontWeight`, `gap`, `mb`, `mt` as direct props fail typecheck:
- `Typography fontWeight={700}` → `sx={{ fontWeight: 700 }}`
- `Stack gap={2}` → `sx={{ gap: 2 }}`

Renamed props:
- `PaperProps` → `slotProps={{ paper: { ... } }}`
- `InputLabelProps` → `slotProps={{ inputLabel: { ... } }}`
- `primaryTypographyProps` → `slotProps={{ primary: { sx: { ... } } }}`

## Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/` | RootRedirect → `/:user` if logged in, else PortfolioHome | — |
| `/login` | Login (shader left + form right, `#FFE213` accent) | — |
| `/inbox` | Inbox | AuthGuard |
| `/banned` | Banned | — |
| `/admin` | AdminLayout (nested routes below) | AuthGuard + AdminGuard |
| `/admin/articles` | ArticleManager | AuthGuard + AdminGuard |
| `/admin/videos` | AdminVideos | AuthGuard + AdminGuard |
| `/admin/messages` | AdminMessages | AuthGuard + AdminGuard |
| `/admin/notifications` | AdminNotifications | AuthGuard + AdminGuard |
| `/admin/settings` | AdminSettings | AuthGuard + AdminGuard |
| `/admin/community` | AdminCommunity | AuthGuard + AdminGuard + SuperAdminGuard |
| `/:user` | PortfolioHome (tenant public profile) | — |
| `/:user/blog` | Blog (paginated articles) | — |
| `/:user/blog/:slug` | BlogArticle | — |
| `/:user/videos` | BlogVideos | — |

**IMPORTANT**: Route param is `:user` (not `:username`). Use `useParams<{ user: string }>()`.

## Architecture

- **API**: Cloudflare Pages Functions in `functions/api/`. `PagesFunction<Env>` interface.
  - `/api/articles` — paginated articles (anon key, public)
  - `/api/newsletter` — subscription with Turnstile (anon key, public)
  - `/api/resources` — tenant resources by username (forwards user JWT to Supabase RLS)
  - `/sitemap.xml` — dynamic XML sitemap (anon key, public)
- **DB**: Supabase. Migrations in `supabase/migrations/`. Tables: `admin_articles`, `blog_categories`, `newsletter_subscribers`, `user_roles`, `user_profiles`, `messages`, `message_reads`, `notifications`, `notification_reads`, `tenant_resources`.
- **Portfolio**: GSAP animations, zustand store (`src/store/portfolio.ts`) with `persist` middleware (localStorage, key `portfolio-store-v2`). Profile data synced to `user_profiles` table via `useProfile` hook. Default tenant: `mopaossi`.
- **Auth**: Supabase email/password. Role hierarchy: `superadmin` > `admin` > `user`. Banned users blocked at AuthGuard level.
- **JWT Security**: CF Functions forward the user's Authorization header to Supabase for RLS enforcement. Never expose `SUPABASE_ANON_KEY` on the client. The `VITE_SUPABASE_PUBLISHABLE_KEY` is the public anon key (protected by RLS).
- **Admin**: Auth via Supabase email/password. Role check via `user_roles` table. BlockNote v6 editor (sync `tryParseHTMLToBlocks`, no `.then()`).
- **Images**: Static SVGs in `public/assets/`, referenced as `/assets/*.svg`. User avatars in Supabase Storage bucket `avatars` (uploaded via `useProfile.uploadAvatar()`).
- **SEO**: `SEOHead.tsx` for meta/OG/Twitter/JSON-LD/Dublin Core. Dynamic sitemap at `/sitemap.xml`. `google-site-verification` = `a084537dcebf8a31`. `robots.txt` allows all crawlers. `llms-full.txt` for AI indexing.

## Key stores

| Store | File | Purpose |
|-------|------|---------|
| `usePortfolioStore` | `src/store/portfolio.ts` | activeTab + profile data, persisted to localStorage (key: `portfolio-store-v2`) |
| `useInboxStore` | `src/store/inbox.ts` | inbox open state |

## Gotchas

- `tsc --noEmit` passes even with some MUI v9 type mismatches (pre-existing, ~9 errors from Cloudflare Functions). Build succeeds.
- No CSS framework — MUI + Emotion + inline Tailwind (vite plugin, minimal use).
- `motion` package (formerly framer-motion) used for AnimatedTabs, ArticleListItem animations.
- Cloudflare Functions (`functions/`, `supabase/functions/`) use `PagesFunction` type from Cloudflare Workers runtime — tsc reports `Cannot find name 'PagesFunction'` (false positive, works at runtime).
- GSAP SVG flip animation chains across Instagram → GitHub → Discord in a loop.
- Profile data lives in zustand (localStorage cache) + Supabase `user_profiles` table. Always write to both.
- `useRole()` returns `{ role, isAdmin, isSuperAdmin, isBanned, isVerified }`. Admin = role 'admin' OR 'superadmin'. SuperAdmin = role 'superadmin' only.
- Route param is `:user` — use `useParams<{ user: string }>()`, NOT `{ username }`.
- CF Functions forward user JWT to Supabase. The `Authorization` header from the client is passed to Supabase REST API for RLS enforcement. Anon key is fallback for unauthenticated requests.
- `vendor-animation` chunk removed from manualChunks (circular dependency fix). GSAP/motion in main `vendor` chunk.
- Login page: Three.js shader animation left (55%), form right (45%), `#FFE213` accent, no admin links, no overlay text on shader.
- BlogArticle: no BlogLayout/Nav, avatar from `usePublicProfile(user)`.
