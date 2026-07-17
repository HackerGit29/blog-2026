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
│  │  /api/resources │  │       ├── blog_categories
│  │  /sitemap.xml   │  │       ├── newsletter_subscribers
│  └────────────────┘  │       ├── tenant_resources
│                      │       ├── user_roles
│  ┌────────────────┐  │       └── user_profiles
│  │  Static Assets  │  │     ┌──────────────────┐
│  │  (dist/)        │  │     │  Turnstile.js    │
│  └────────────────┘  │     │  (Cloudflare)    │
│                      │     └──────────────────┘
│  JWT forwarding:     │
│  CF Functions pass   │
│  user's Authorization│
│  header to Supabase  │
│  for RLS enforcement │
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
| SEO | react-helmet-async + JSON-LD + Dublin Core |
| State | Zustand (persist key: `portfolio-store-v2`) |
| Animations | GSAP 3.15 + @gsap/react + Three.js (shader) |
| Backend API | Cloudflare Pages Functions (Workers) |
| Database | Supabase (PostgreSQL) |
| Auth / Bot protection | Cloudflare Turnstile |
| Déploiement | Cloudflare Pages (Wrangler CLI) |
| Domaine | benji-aka-dev.site (Cloudflare DNS, Namecheap registrar) |

---

## Pages et routes

| Route | Description |
|-------|-------------|
| `/` | RootRedirect → `/:user` si connecté, sinon PortfolioHome par défaut (mopaossi) |
| `/login` | Connexion admin (shader Three.js à gauche, formulaire à droite, accent `#FFE213`) |
| `/:user` | Portfolio public (tabs Blog/Vidéos/Ressources/À propos) |
| `/:user/blog` | Liste des articles avec pagination serveur |
| `/:user/blog/:slug` | Article détaillé |
| `/:user/videos` | Tutoriels vidéo avec workspace interactif |
| `/admin` | Dashboard admin (articles, vidéos, communauté, réglages) |

---

## API (Cloudflare Pages Functions)

### `GET /api/articles`

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
  "data": [{ "id": "...", "title": "...", "slug": "...", "category": {...} }],
  "total": 42, "total_all": 42,
  "page": 1, "per_page": 9, "total_pages": 5,
  "category_counts": { "uuid-cat-1": 12, "uuid-cat-2": 8 }
}
```

### `GET /api/resources`

Ressources tenant pour un utilisateur donné. Forward le JWT de l'utilisateur à Supabase pour l'application des politiques RLS.

**Paramètres** (query string) :

| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `username` | string | Oui | Nom d'utilisateur du tenant |

**Sécurité** : Le header `Authorization` du client est transmis à Supabase. Si absent, la clé anon est utilisée (RLS applique `is_visible = true`).

**Réponse** :
```json
[
  { "id": "...", "title": "...", "description": "...", "url": "...", "category": "learn", "icon": "graduation-cap", "sort_order": 1 }
]
```

### `POST /api/newsletter`

Inscription à la newsletter avec vérification Turnstile. Rate limiting : 5 requêtes/min/IP.

**Body** : `{ "email": "user@example.com", "turnstileToken": "0.xxxxx..." }`

### `GET /sitemap.xml`

Sitemap XML dynamique listant toutes les pages et articles publiés.

---

## Base de données (Supabase)

- **`admin_articles`** : Articles de blog (titre, slug, contenu HTML, image/vidéo, catégorie, tags, statut, date publication, author_id)
- **`blog_categories`** : Catégories (nom, slug, description, icône, couleur)
- **`newsletter_subscribers`** : Abonnés newsletter (email, source, statut)
- **`user_roles`** : Rôles utilisateur (uid, role) — enum: `superadmin`, `admin`, `moderator`, `user`
- **`user_profiles`** : Profils utilisateur (name, title, location, avatar_url, socials, stats, is_verified, is_banned, username)
- **`tenant_resources`** : Ressources par tenant (user_id, title, description, url, category, icon, sort_order, is_visible)
- **`messages`** : Messages in-app (title, body, cover, CTA, status, author_id)
- **`message_reads`** : Statut de lecture des messages
- **`notifications`** : Notifications (kind, title, body, icon, CTA, author_id)
- **`notification_reads`** : Statut de lecture des notifications

Vue `article_list` : jointure admin_articles + blog_categories, filtrée sur is_published = true.

### Hiérarchie des rôles

| Rôle | Accès |
|------|-------|
| `superadmin` | Tout (community, ban, gestion rôles) |
| `admin` | Dashboard + propres articles/vidéos/messages/notifications |
| `user` | Profil public, messages reçus, notifications |
| `banned` | Bloqué (is_banned=true) |

### Sécurité JWT

Les Cloudflare Functions forwardnt le header `Authorization` du client à Supabase pour l'application des politiques RLS. La clé anon (`SUPABASE_ANON_KEY`) est utilisée en fallback pour les requêtes non authentifiées. Les tokens ne sont jamais exposés côté client.

---

## Développement local

```bash
npm install
cp .env.example .env   # Éditer avec clés Supabase + Turnstile
npm run dev             # → http://0.0.0.0:3000
npm run build           # → dist/
npm run lint            # tsc --noEmit
supabase db push        # Appliquer les migrations
npx wrangler pages deploy dist --project-name blog-2026 --branch main
```

### Variables d'environnement

```
VITE_SUPABASE_URL="https://votre-projet.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="votre-cle-anon"
VITE_TURNSTILE_SITEKEY="0x4AAAAA..."
```

Secrets (Cloudflare Pages → Settings → Environment variables → Production) : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TURNSTILE_SECRET`.

---

## Licence

Apache 2.0
