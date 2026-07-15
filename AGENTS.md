# Blog — Agent Instructions

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server on `0.0.0.0:3000` |
| `npm run lint` | `tsc --noEmit` (only typecheck, no linter) |
| `npm run build` | `vite build` → `dist/` |
| `npx supabase db push` | Apply Supabase migrations |
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
- **DB**: Supabase. Migrations in `supabase/migrations/`. Tables: `admin_articles`, `blog_categories`, `newsletter_subscribers`, `user_roles`.
- **Portfolio**: GSAP animations, zustand store (`src/store/portfolio.ts`), profile data in `src/data/portfolio.ts`.
- **Admin**: Auth via Supabase email/password. Role check via `user_roles` table. BlockNote v6 editor (sync `tryParseHTMLToBlocks`, no `.then()`).
- **Images**: Static SVGs in `public/assets/`, referenced as `/assets/*.svg`.
- **SEO**: `SEOHead.tsx` for meta/OG/Twitter/JSON-LD. Dynamic sitemap at `/sitemap.xml`.

## Gotchas

- `tsc --noEmit` passes even with some MUI v9 type mismatches (pre-existing, ~45 errors). Build may still succeed.
- No CSS framework — MUI + Emotion + inline Tailwind (vite plugin, minimal use).
- `motion` package (formerly framer-motion) used for AnimatedTabs, ArticleListItem animations.
- Cloudflare Functions (`functions/`, `supabase/functions/`) use `PagesFunction` type from Cloudflare Workers runtime — tsc --noEmit reports `Cannot find name 'PagesFunction'` (false positive, works at runtime).
