# Spécifications des Profils : Architecture Multi-Tenant et URLs Conviviales

Ce document détaille le fonctionnement de l'espace portfolio public, la redirection dynamique de la racine et la structure multi-tenant des profils utilisateur.

---

## 1. Structure de l'URL Conviviale `/:user`

Pour abandonner les identifiants UUID complexes (ex: `/u/b329b877-...`), l'application utilise des noms d'utilisateurs conviviaux (slugs) directement positionnés à la racine de l'URL :
*   **Format de l'URL** : `https://domaine.com/:user` (ex: `https://domaine.com/mopaossi`).
*   **Paramètre de route** : `:user` (pas `:username`). Utiliser `useParams<{ user: string }>()`.
*   **Priorité de Routage** : Dans [`routes.tsx`](src/app/routes.tsx), la route `/:user` est déclarée en dernière position des routes de premier niveau. Ainsi, les routes statiques exactes (comme `/blog`, `/login`, `/admin`) correspondent en priorité, évitant tout conflit de nommage.

---

## 2. Redirection Dynamique de la Racine `/`

Le composant [`RootRedirect.tsx`](src/components/auth/RootRedirect.tsx) gère le point d'entrée principal de l'application :

1.  **Visiteur Anonyme** : Redirigé vers `/mopaossi` (profil par défaut du tenant).
2.  **Utilisateur Connecté** : 
    *   L'application interroge Supabase en arrière-plan pour obtenir le champ `username` associé à son compte (`user_id`).
    *   Dès que le nom d'utilisateur est récupéré, il est automatiquement redirigé vers sa page publique personnelle : `/:user`.

---

## 3. Rendu du Portfolio et Isolation des Données (Multi-Tenant)

### Lecture Sécurisée des Données Publiques
Lorsqu'un visiteur charge la page `/:user` :
1.  Le paramètre `user` est extrait de l'URL par [`PortfolioHome.tsx`](src/pages/PortfolioHome.tsx) via `useParams<{ user: string }>()`.
2.  Le hook [`usePublicProfile.ts`](src/hooks/usePublicProfile.ts) interroge la table `user_profiles` en filtrant sur `username` (converti en minuscules).
3.  Si le profil existe, ses informations publiques (nom, profession, localisation, avatar, réseaux sociaux et statistiques) sont renvoyées.

### Injection Locale (`profileOverride`)
Pour éviter de polluer le store global Zustand (qui gère l'état hors-connexion ou les préférences de l'utilisateur connecté localement) :
*   Le composant [`PortfolioHome.tsx`](src/pages/PortfolioHome.tsx) transmet le profil public récupéré sous forme de prop `profileOverride` au composant [`ProfileSection.tsx`](src/components/portfolio/ProfileSection.tsx).
*   Si cette prop `profileOverride` est fournie, le composant de profil affiche ces données publiques à la place de l'état local du store.

### Ressources Tenant
Le tab "Ressources" dans le portfolio charge les ressources via `useTenantResources(username)`, qui appelle `GET /api/resources?username=...`. La Cloudflare Function forward le JWT utilisateur à Supabase pour l'application des RLS policies.

---

## 4. Protection des Statistiques de Profil

Les colonnes statistiques de la table `user_profiles` (`followers`, `following`, `likes`) et le badge de certification (`is_verified`) sont protégés :
*   **Côté Client** : Les champs d'édition de ces statistiques sont désactivés ou masqués dans les écrans de configuration ([`AdminSettings.tsx`](src/pages/admin/AdminSettings.tsx) et [`UserSettings.tsx`](src/components/portfolio/UserSettings.tsx)).
*   **Côté API** : Le hook [`useProfile.ts`](src/hooks/useProfile.ts) n'envoie pas ces colonnes sensibles lors de la synchronisation via la méthode `upsert`.
*   **Côté Serveur** : Le trigger de base de données PostgreSQL rejette ou ignore toute tentative de modification de ces colonnes provenant d'un utilisateur standard.

---

## 5. Upload d'Avatar

L'upload d'avatar est disponible dans `UserSettings.tsx` et `AdminSettings.tsx` via une icône camera. Le fichier est uploadé dans le bucket Supabase Storage `avatars` via `useProfile.uploadAvatar(file)`, qui retourne l'URL publique. L'URL est sauvegardée dans `user_profiles.avatar_url`.
