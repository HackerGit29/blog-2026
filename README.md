# Benji AKA Dev — Blog IA, Cloud & DevOps

Blog technique sur l'intelligence artificielle, Microsoft Learn, Power Platform, Cloud, DevOps et développement web.  
Déployé sur **Cloudflare Pages** avec **Supabase** comme backend, **Cloudflare Turnstile** pour la protection anti-bot, et **React 19** côté frontend.

---

## Architecture

```
┌──────────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Cloudflare Pages   │────▶│  Cloudflare DNS  │────▶│   Domain    │
│   (CDN + Workers)    │     │  (A/CNAME proxy) │     │ benji-aka-  │
│                      │     │                  │     │ dev.site    │
│  ┌────────────────┐  │     └──────────────────┘     └─────────────┘
│  │  Pages Function │  │
│  │  (API)          │──┼──▶ Supabase (REST API)
│  │  /api/articles  │  │       │
│  │  /api/newsletter│  │       ├── admin_articles
│  │  /sitemap.xml   │  │       ├── blog_categories
│  └────────────────┘  │       └── newsletter_subscribers
│                      │
│  ┌────────────────┐  │     ┌──────────────────┐
│  │  Static Assets  │  │     │  Turnstile.js    │
│  │  (dist/)        │  │     │  (Cloudflare)    │
│  └────────────────┘  │     └──────────────────┘
└──────────────────────┘
```

### Stack

| Couche | Technologie |
|--------|------------|
| Frontend | React 19 + TypeScript + Vite 6 |
| UI | MUI 9 + Emotion + motion (framer-motion) |
| Routing | React Router 7 |
| Data fetching | TanStack React Query 5 |
| Forms | React Hook Form + Zod |
| SEO | react-helmet-async + JSON-LD |
| State | Zustand |
| Backend API | Cloudflare Pages Functions (Workers) |
| Database | Supabase (PostgreSQL) |
| Auth / Bot protection | Cloudflare Turnstile |
| Déploiement | Cloudflare Pages (git push → auto-deploy) |
| Domaine | benji-aka-dev.site (Cloudflare DNS, Namecheap registrar) |

---

## Structure du projet

```
├── functions/               # Cloudflare Pages Functions (API)
│   ├── api/
│   │   ├── articles.ts      # Pagination serveur + compteurs catégories
│   │   └── newsletter.ts    # Inscription newsletter + Turnstile verify
│   └── sitemap.ts           # Sitemap XML dynamique
├── public/                  # Assets statiques
│   ├── _headers             # En-têtes de sécurité (CSP, HSTS, etc.)
│   ├── robots.txt
│   ├── site.webmanifest
│   ├── favicon.ico / .png   # Favicons multi-tailles
│   └── googlea084537dcebf8a31.html  # Vérification Search Console
├── src/
│   ├── app/
│   │   ├── providers.tsx    # Providers: MUI theme, QueryClient, Router, Helmet
│   │   └── routes.tsx       # Routes: /blog, /blog/:slug, /blog/videos, /admin
│   ├── components/
│   │   ├── admin/           # Composants admin (dashboard)
│   │   ├── blog/            # Composants blog (cards, layout, newsletter, filters)
│   │   ├── SEOHead.tsx      # Meta tags + JSON-LD structuré
│   │   └── TurnstileWidget.tsx  # Widget Turnstile (rendu explicite React)
│   ├── hooks/
│   │   ├── useBlogArticles.ts     # Articles paginés via API
│   │   ├── useBlogArticle.ts      # Article par slug
│   │   ├── useBlogCategories.ts   # Catégories
│   │   ├── useRelatedArticles.ts  # Articles connexes
│   │   └── useNewsletterSubscribe.ts  # Inscription newsletter
│   ├── integrations/supabase/
│   │   ├── client.ts        # Client Supabase (anon key)
│   │   └── types.ts         # Types générés Database
│   ├── pages/
│   │   ├── Blog.tsx         # Liste blog + pagination
│   │   ├── BlogArticle.tsx  # Article détaillé
│   │   ├── BlogVideos.tsx   # Vidéos filtrées
│   │   └── AdminContent.tsx # Dashboard admin
│   └── App.tsx
├── supabase/
│   └── migrations/
│       ├── 20260714000001_create_tables.sql   # Tables + RLS
│       └── 20260714000002_create_views_and_indexes.sql  # Vue article_list + index GIN
├── wrangler.toml           # Config Cloudflare Pages
└── .env                    # Variables d'environnement locales
```

---

## Pages et routes

| Route | Description |
|-------|-------------|
| `/` | Redirige vers `/blog` |
| `/blog` | Liste des articles avec pagination serveur, filtres (catégorie, média, recherche) |
| `/blog/:slug` | Article détaillé (éditorial ou tutoriel vidéo) |
| `/blog/videos` | Tutoriels vidéo uniquement |
| `/admin/content` | Dashboard de gestion de contenu |

---

## API (Cloudflare Pages Functions)

### `GET /api/articles`

Endpoint principal de pagination serveur.

**Paramètres** (query string) :

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `page` | number | `1` | Numéro de page |
| `per_page` | number | `9` | Éléments par page (max 50) |
| `search` | string | — | Recherche plein texte (title + summary) |
| `category_id` | uuid | — | Filtre par catégorie |
| `media_type` | `image` / `video` | — | Filtre par type de média |

**Réponse** :
```json
{
  "data": [{ "id": "...", "title": "...", "slug": "...", "category": {...}, ... }],
  "total": 42,
  "total_all": 42,
  "page": 1,
  "per_page": 9,
  "total_pages": 5,
  "category_counts": { "uuid-cat-1": 12, "uuid-cat-2": 8 }
}
```

### `POST /api/newsletter`

Inscription à la newsletter avec vérification Turnstile.

**Body** :
```json
{ "email": "user@example.com", "turnstileToken": "0.xxxxx..." }
```

**Réponse** : `{ "success": true }` ou `{ "error": "..." }` (400, 403, 409, 429, 500)

Rate limiting : 5 requêtes/min/IP.

### `GET /sitemap.xml`

Sitemap XML dynamique listant toutes les pages et articles publiés.

---

## Base de données (Supabase)

### Tables

- **`admin_articles`** : Articles de blog (titre, slug, contenu HTML, image/vidéo, catégorie, tags, statut, date publication)
- **`blog_categories`** : Catégories (nom, slug, description, icône, couleur)
- **`newsletter_subscribers`** : Abonnés newsletter (email, source, statut)

### Vues

- **`article_list`** : Jointure `admin_articles` + `blog_categories`, filtrée sur `is_published = true`

### Indexes

- GIN trigram sur `admin_articles.title` (recherche ILIKE)
- GIN trigram sur `admin_articles.summary` (recherche ILIKE)
- Index partiel sur `admin_articles(published_at desc)` WHERE `is_published = true`
- Index B-tree sur `admin_articles.slug`, `status`, `category_id`, `published_at desc`

### RLS

- `blog_categories` : SELECT public
- `admin_articles` : SELECT public si `status = 'published'`
- `newsletter_subscribers` : INSERT public (pour formulaire)

---

## Sécurité

| Mesure | Détails |
|--------|---------|
| CSP | Restrictif : scripts, styles, images, connexions listées |
| HSTS | 1 an, includeSubDomains, preload |
| X-Frame-Options | DENY |
| Permissions-Policy | Caméra, micro, géolocalisation bloqués |
| Turnstile | Widget visible + vérification serveur (siteverify) |
| Rate limiting | Newsletter : 5 req/min/IP |
| Cache immuable | Assets build : Cache-Control 1 an |
| Headers personnalisés | `public/_headers` pour toutes les routes |

---

## SEO

- Meta tags dynamiques (OG, Twitter Cards) via `SEOHead.tsx`
- Données structurées JSON-LD (`BlogPosting`)
- Sitemap XML dynamique (`/sitemap.xml`)
- `robots.txt` : autorise tout, pointe vers le sitemap
- Canonical URLs
- Fichier de vérification Google Search Console déployé
- `site.webmanifest` pour PWA

---

## Développement local

```
# 1. Cloner le dépôt
git clone https://github.com/HackerGit29/blog-2026.git
cd blog-2026

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase et Turnstile

# 4. Lancer le serveur de développement
npm run dev
```

### Variables d'environnement

```
# .env
VITE_SUPABASE_URL="https://votre-projet.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="votre-cle-anon"
VITE_TURNSTILE_SITEKEY="0x4AAAAA..."
```

Variables secrètes (Cloudflare Pages → Settings → Environment variables → Production) :

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Clé anon Supabase |
| `TURNSTILE_SECRET` | Secret key Turnstile (vérification serveur) |

---

## Déploiement

Le déploiement est automatisé via Cloudflare Pages connecté au dépôt GitHub :

1. Pousser sur `main` → Cloudflare Pages build + déploie automatiquement
2. Déploiement manuel : `npm run build && wrangler pages deploy dist --project-name blog-2026 --branch main`

### Base de données

```
npx supabase db push          # Appliquer les migrations
npx supabase gen types typescript --local > src/integrations/supabase/types.ts  # Régénérer les types
```

---

## Licence

Apache 2.0
