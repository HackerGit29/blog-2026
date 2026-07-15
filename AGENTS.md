# Blog — Agent Instructions

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server on `0.0.0.0:3000` |
| `npm run lint` | `tsc --noEmit` (only typecheck, no linter) |
| `npm run build` | `vite build` → `dist/` |
| `supabase db push` | Apply Supabase migrations |
| `supabase gen types typescript --linked > src/integrations/supabase/types.ts` | Regenerate DB types |
| `npm run clean` | `rm -rf dist server.js` |

No test framework configured.

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
| `/` | PortfolioHome (tabs: Blog/Videos/Ressources/A propos) | — |
| `/blog` | Blog (paginated articles, ArticleCard grid) | — |
| `/blog/videos` | BlogVideos (TutorialWorkspace + TutorialCard) | — |
| `/blog/:slug` | BlogArticle | — |
| `/login` | Login | — |
| `/admin` | AdminLayout (nested: dashboard, articles, videos, community, settings) | AuthGuard + AdminGuard |
| `/admin/content` | AdminContent | AuthGuard + AdminGuard |

## Architecture

- **API**: Cloudflare Pages Functions in `functions/api/` (`/api/articles`, `/api/newsletter`). `PagesFunction<Env>` interface.
- **DB**: Supabase. Migrations in `supabase/migrations/`. Tables: `admin_articles`, `blog_categories`, `newsletter_subscribers`, `user_roles`, `user_profiles`.
- **Portfolio**: GSAP animations, zustand store (`src/store/portfolio.ts`) with `persist` middleware (localStorage cache). Profile data synced to `user_profiles` table via `useProfile` hook.
- **Header**: Shows "Se connecter" when logged out, avatar + settings when logged in. `UserSettings` dialog edits profile (name, title, socials, stats). Admin link visible via `useRole()` JWT check.
- **Admin**: Auth via Supabase email/password. Role check via `user_roles` table. BlockNote v6 editor (sync `tryParseHTMLToBlocks`, no `.then()`).
- **Images**: Static SVGs in `public/assets/`, referenced as `/assets/*.svg`. User avatars in Supabase Storage bucket `avatars`.
- **SEO**: `SEOHead.tsx` for meta/OG/Twitter/JSON-LD. Dynamic sitemap at `/sitemap.xml`.

## Key stores

| Store | File | Purpose |
|-------|------|---------|
| `usePortfolioStore` | `src/store/portfolio.ts` | activeTab + profile data, persisted to localStorage |

## Gotchas

- `tsc --noEmit` passes even with some MUI v9 type mismatches (pre-existing, ~9 errors from Cloudflare Functions). Build succeeds.
- No CSS framework — MUI + Emotion + inline Tailwind (vite plugin, minimal use).
- `motion` package (formerly framer-motion) used for AnimatedTabs, ArticleListItem animations.
- Cloudflare Functions (`functions/`, `supabase/functions/`) use `PagesFunction` type from Cloudflare Workers runtime — tsc reports `Cannot find name 'PagesFunction'` (false positive, works at runtime).
- GSAP SVG flip animation chains across Instagram → GitHub → Discord in a loop.
- Profile data lives in zustand (localStorage cache) + Supabase `user_profiles` table. Always write to both.
