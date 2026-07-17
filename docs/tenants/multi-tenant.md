# Système Multi-Tenant

Architecture multi-tenant où chaque utilisateur avec le rôle `admin` ou `superadmin` dispose de son propre espace de gestion.

---

## Hiérarchie des rôles

| Rôle | Description | Accès |
|------|-------------|-------|
| `superadmin` | Propriétaire de l'application | Tout (community, ban, gestion rôles) |
| `admin` | Administrateur de contenu | Dashboard + propres articles/vidéos/messages/notifications |
| `user` | Utilisateur standard | Profil public, messages reçus, notifications |
| `banned` | Utilisateur banni | Bloqué (is_banned=true) |

---

## Tables

### `user_roles`
- `user_id` (uuid, FK auth.users)
- `role` (enum: superadmin, admin, moderator, user)
- `created_at` (timestamptz)

### `user_profiles`
- `user_id` (uuid, FK auth.users, unique)
- `name`, `title`, `location`, `avatar_url`, `username`
- `socials` (jsonb: discord, github, instagram)
- `followers`, `following`, `likes` (text, protégés par trigger)
- `is_verified` (boolean, protégé par trigger)
- `is_banned` (boolean)

### `tenant_resources`
- `id` (uuid, PK)
- `user_id` (uuid, FK auth.users, index)
- `title` (text, not null)
- `description` (text)
- `url` (text, not null)
- `category` (text, default 'learn') — valeurs: `learn`, `platform`, `tool`, `community`
- `icon` (text, default 'link')
- `sort_order` (int, default 0)
- `is_visible` (boolean, default true)
- `created_at`, `updated_at` (timestamptz)

---

## RLS Policies

### `admin_articles`
- SELECT/INSERT/UPDATE/DELETE : `auth.uid() = author_id OR is_superadmin()`
- Bloqué si `is_banned() = true`

### `user_profiles`
- SELECT : `auth.uid() = user_id OR is_superadmin()`
- INSERT : `auth.uid() = user_id AND NOT is_banned()`
- UPDATE : `(auth.uid() = user_id OR is_superadmin()) AND NOT is_banned()`

### `user_roles`
- SELECT : `auth.uid() = user_id` (any user can read own role)
- INSERT/UPDATE/DELETE : `is_superadmin()` only

### `tenant_resources`
- SELECT : `is_visible = true` (public read for visible resources)
- ALL (INSERT/UPDATE/DELETE) : `auth.uid() = user_id` (owner manages own resources)

### `messages`, `notifications`
- SELECT/INSERT/UPDATE/DELETE : `is_superadmin() OR (auth.uid() = author_id AND role IN ('admin', 'superadmin'))`

### `blog_categories`
- ALL : `is_superadmin() OR role = 'admin'`

---

## Sécurité JWT

Les Cloudflare Functions (`functions/api/`) implémentent le forwarding du JWT utilisateur :

1. **Extraction** : Le header `Authorization` de la requête entrante est extrait.
2. **Forwarding** : Si le header contient un JWT valide (`Bearer eyJ...`), il est transmis à Supabase REST API.
3. **Fallback** : Sans header `Authorization`, la clé anon (`SUPABASE_ANON_KEY`) est utilisée.
4. **RLS** : Supabase applique les politiques RLS en fonction du token. Pour `tenant_resources`, la policy `is_visible = true` permet l'accès public. Pour les endpoints authentifiés, la policy vérifie `auth.uid() = user_id`.

**Règle** : Les tokens ne sont jamais exposés côté client. Le `VITE_SUPABASE_PUBLISHABLE_KEY` est la clé anon publique (protégée par RLS).

---

## Trigger : protect_profile_fields

Empêche les utilisateurs de modifier leurs propres :
- `followers`, `following`, `likes` (statistiques)
- `is_verified` (badge de vérification)

Seul le rôle `service_role` peut modifier ces champs.

---

## Migration vers multi-tenant

Les migrations appliquées :
1. `20260715000001` : Table `user_roles` avec enum `app_role`
2. `20260716000001` : Table `user_profiles` + bucket avatars
3. `20260718000001` : Multi-tenant (author_id, trigger, RLS)
4. `20260720000001` : Grant admin à admin@akadev.site + RPC
5. `20260720000002` : Enum superadmin ajouté
6. `20260720000003` : RLS superadmin/ban system
7. `20260721000001` : Fix user_roles RLS (restore SELECT own role)
8. `20260722000001` : Table `tenant_resources`
9. `20260722000002` : Seed 20 ressources Microsoft par défaut (admin tenant)
