# Spécifications de Sécurité : Protection XSS et Validation des Profils

Ce document détaille les mesures de sécurité mises en œuvre pour protéger l'application contre les failles d'injection de scripts (XSS) et garantir l'intégrité des informations utilisateur (Validation des noms d'utilisateurs).

---

## 1. Protection contre les Injections de Scripts (XSS)

Pour afficher du contenu riche (généré par l'éditeur de texte BlockNote ou converti depuis du Markdown) de manière sûre, l'application utilise **DOMPurify** avec des règles de filtrage strictes.

### Utilisation de la Bibliothèque d'Assainissement
Toutes les chaînes HTML insérées via `dangerouslySetInnerHTML` passent par le module centralisé [`src/lib/sanitize.ts`](src/lib/sanitize.ts) :
*   **Allowlist de balises autorisées** : Seules les balises sémantiques et de mise en forme sûres sont acceptées (`p`, `br`, `strong`, `h1`-`h6`, `code`, `pre`, `table`, etc.). Les balises potentiellement dangereuses (`script`, `iframe`, `object`, `embed`, `style`) sont systématiquement supprimées.
*   **Allowlist d'attributs autorisés** : Seuls les attributs nécessaires et sans danger sont conservés (`href`, `src`, `alt`, `class`, `rel`, `colspan`, etc.).
*   **Attributs de sécurité** : L'attribut `rel="noopener noreferrer"` est ajouté automatiquement à tous les liens externes.
*   **Blocage des schémas d'URI** : Les URLs suspectes commençant par `javascript:` sont automatiquement neutralisées.

### Points de Contrôle Sécurisés
*   **Articles de Blog** : Le composant [`BlogArticle.tsx`](src/pages/BlogArticle.tsx) utilise le helper `createSafeMarkup` pour injecter le corps de l'article assaini.
*   **Boîte de Réception (Inbox)** : Le composant [`MessageDrawer.tsx`](src/components/inbox/MessageDrawer.tsx) assainit le corps du message reçu avant tout rendu.

---

## 2. Validation & Unicité du Nom d'Utilisateur

Pour offrir des URLs conviviales du type `/$username`, le nom d'utilisateur est assaini et validé de manière stricte.

### Règles de Transformation de l'URL
Lors de la saisie d'un nouveau nom d'utilisateur dans les paramètres, les règles suivantes sont appliquées automatiquement :
1.  **Minuscules systématiques** : Tout caractère majuscule est converti en minuscule.
2.  **Remplacement des caractères spéciaux** : Tout groupe de caractères non-alphanumériques (y compris les espaces) est converti en un tiret unique (`-`).
3.  **Nettoyage des extrémités** : Les tirets en début ou fin de chaîne sont supprimés.

### Vérification de Disponibilité en Temps Réel (Style GitHub)
Le composant [`AdminSettings.tsx`](src/pages/admin/AdminSettings.tsx) intègre un mécanisme de vérification de disponibilité asynchrone :
*   **Debounce (400ms)** : Pour préserver les performances de la base de données, la requête SQL n'est lancée qu'après une pause de 400 millisecondes dans la saisie.
*   **Exclusion de l'utilisateur courant** : La vérification compare le nom d'utilisateur avec tous les autres profils enregistrés en base, en excluant le compte actuellement connecté.
*   **Feedback Visuel** : Un message de validation s'affiche sous le champ en temps réel :
    *   `Vert` : Nom disponible ou nom d'utilisateur actuel.
    *   `Rouge` : Nom déjà utilisé par un autre utilisateur ou format invalide.
*   **Blocage à la soumission** : Le formulaire refuse d'enregistrer les modifications tant que le nom d'utilisateur choisi n'est pas disponible et valide.

---

## 3. Politiques RLS (Row Level Security) sur Supabase

L'intégrité des profils utilisateur est garantie au niveau de la base de données par des politiques d'accès strictes :
*   **Lecture Publique** : La politique `Anyone can view public profiles` permet à n'importe quel visiteur de lire les profils (nécessaire pour afficher les portfolios publics).
*   **Écriture Restreinte** : Les opérations de modification (`INSERT`, `UPDATE`) sont restreintes à l'utilisateur propriétaire via la condition `auth.uid() = user_id`.
*   **Trigger de Protection de Champs Sensibles** : Un trigger PostgreSQL (`tr_protect_profile_fields`) sur la table `user_profiles` interdit à tout utilisateur (sauf le rôle `service_role`) de modifier les statistiques (`followers`, `following`, `likes`) et le statut vérifié (`is_verified`).

---

## 4. Page de Login

La page de login ([`Login.tsx`](src/pages/auth/Login.tsx)) utilise un layout deux colonnes :
*   **Gauche (55%)** : Animation shader Three.js (`ShaderAnimation.tsx`) avec nettoyage `useEffect` pour éviter les fuites WebGL.
*   **Droite (45%)** : Formulaire de connexion avec fond noir `#0a0a0a`, accent `#FFE213`, inputs stylisés avec bordures sombres.
*   **Aucun lien admin** visible sur la page de login.
*   **Aucun overlay text** sur le shader.

---

## 5. Sécurité JWT côté serveur

Les Cloudflare Functions ne jamais exposent les tokens côté client :
*   Le header `Authorization` du client est forwardé à Supabase REST API pour l'application des RLS policies.
*   Sans header, la clé anon est utilisée en fallback (requêtes publiques).
*   Le `VITE_SUPABASE_PUBLISHABLE_KEY` est la clé anon publique, protégée par RLS.
*   Aucun token n'est loggé ou stocké dans le code client.
