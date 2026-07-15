# In-App Messages & Notifications — Design

**Date** : 2026-07-15
**Statut** : Validé, prêt pour implémentation
**Auteur** : Agent

## Objectif

Connecter la newsletter du blog à un espace de **messages in-app** (lecture dans un widget compact du header pour les utilisateurs connectés) et un système de **notifications** (annonces, événements, articles, vidéos) avec **marquage lu/non-lu professionnel** et **redirection contextuelle** vers articles, vidéos, liens externes (Microsoft Learn, etc.) ou la boîte de messagerie elle-même.

## Décisions produit

- **Source de vérité** : la table `messages` est éditée par l'admin. Le `newsletter_drafts` n'est qu'un brouillon email optionnel qui pointe vers un message in-app.
- **Cibles CTA** : 5 types — `article` (slug), `video` (video_id), `external` (URL libre), `message` (message_id), `none` (info seule).
- **Realtime** : Supabase Realtime (canaux Postgres `messages` et `notifications`). Pas de Socket.IO custom (incompatible avec Cloudflare Pages Workers stateless).
- **Authentification requise** : seules les personnes connectées voient le widget Bell/Mail et lisent les messages.
- **Pas d'inscription de masse** : l'abonnement à la newsletter reste indépendant (`newsletter_subscribers` table séparée, formulaire public).

## Schéma de données

### Migration `20260717000001_create_messages.sql`

```sql
create table messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  body text not null,
  cover_url text,
  cta_label text,
  cta_url text,
  cta_target text check (cta_target in ('article','video','external','message','none')) default 'none',
  status text default 'draft' check (status in ('draft','scheduled','sent')),
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table message_reads (
  message_id uuid references messages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (message_id, user_id)
);

create index idx_messages_status on messages(status, sent_at desc);
create index idx_message_reads_user on message_reads(user_id);

alter table messages enable row level security;
alter table message_reads enable row level security;

-- Lecture publique des messages "sent" pour les connectés
create policy "Authenticated read sent messages" on messages
  for select using (auth.role() = 'authenticated' and status = 'sent');

-- Admin full access
create policy "Admins manage messages" on messages
  for all using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Lectures : user peut insérer sa propre ligne
create policy "Users insert own reads" on message_reads
  for insert with check (auth.uid() = user_id);

create policy "Users read own reads" on message_reads
  for select using (auth.uid() = user_id);
```

### Migration `20260717000002_create_notifications.sql`

```sql
create type notif_kind as enum ('announcement','event','article','video','message','system');

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  kind notif_kind not null default 'system',
  title text not null,
  body text,
  icon text,
  cta_label text,
  cta_url text,
  cta_target text check (cta_target in ('article','video','external','message','none')) default 'none',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table notification_reads (
  notification_id uuid references notifications(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (notification_id, user_id)
);

create index idx_notif_user_unread on notifications(user_id, created_at desc);
create index idx_notif_reads_user on notification_reads(user_id);

alter table notifications enable row level security;
alter table notification_reads enable row level security;

-- User lit ses propres notifs
create policy "Users read own notifs" on notifications
  for select using (auth.uid() = user_id);

-- Admin insert/broadcast
create policy "Admins manage notifs" on notifications
  for all using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

create policy "Users insert own notif reads" on notification_reads
  for insert with check (auth.uid() = user_id);

create policy "Users read own notif reads" on notification_reads
  for select using (auth.uid() = user_id);

-- Activer realtime sur ces tables
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
```

## Architecture

```
ADMIN LAYOUT
├─ AdminMessages (CRUD, éditeur BlockNote, bouton "Envoyer")
│   └─ envoie → status='sent' + déclenche Cloudflare Function /api/newsletter
└─ AdminNotifications (broadcast tous OU ciblé user_id)

USER LAYOUT (Header)
├─ IconButton Bell
│   └─ NotificationPopover (380×480)
│       ├─ Tabs : Tout | Non lus | Annonces | Événements
│       ├─ Liste groupée par jour
│       └─ Click → markAsRead + routeur cta_target
└─ IconButton Mail
    └─ MessagePopover (380×500)
        ├─ Liste (cover + title + preview 80 chars)
        └─ Click → MessageDrawer (anchor right, 480px wide)
            ├─ Cover + title + body
            └─ Bouton CTA (label, routeur cta_target)

REALTIME (Supabase channel)
├─ channel: `notif:${userId}` → INSERT → met à jour badge
└─ channel: `msg:${userId}` → INSERT → idem

FALLBACK : polling 60s si channel déconnecté (window event 'online'/'offline')
```

## Composants

### Hooks

```typescript
// useNotifications.ts
export function useNotifications() {
  // fetch initial + subscribe realtime
  // returns: { notifications, unreadCount, markAsRead, markAllAsRead, isLoading }
}

// useMessages.ts — idem
// useMessageReads.ts — mark + markAll, optimistic update
// useNotificationReads.ts — idem
// useAdminMessages.ts — CRUD via service role
// useAdminNotifications.ts — broadcast via service role
```

### Store Zustand

```typescript
// store/inbox.ts
interface InboxStore {
  notifUnread: number;
  msgUnread: number;
  lastFetchedNotif: string | null;
  lastFetchedMsg: string | null;
  setUnread: (kind: 'notif'|'msg', n: number) => void;
  reset: () => void;
}
// persisté dans localStorage pour cache
```

### UI

- `NotificationPopover.tsx` : MUI `Popover` + `Tabs` + `List`. Badge rouge en haut-droite de l'icône Bell.
- `MessagePopover.tsx` : idem pour Mail.
- `MessageDrawer.tsx` : MUI `Drawer anchor='right'` width=480. Affiche cover, title, body (render markdown simple), bouton CTA.
- `NotifItem.tsx` : `ListItemButton` avec pastille bleue si non lu + icône lucide selon `kind` + titre + temps relatif ("il y a 2h").
- `MessageItem.tsx` : `ListItemButton` horizontal : cover 56×56 + colonne titre/preview/CTA hint.
- `UnreadBadge.tsx` : petit cercle rouge 10×10 réutilisable.

### Admin

- `AdminMessages.tsx` : table MUI avec colonnes (titre, status, sent_at, actions), dialog d'édition avec BlockNote editor. Bouton "Envoyer" appelle `useAdminMessages().send(id)`.
- `AdminNotifications.tsx` : form avec champs (kind, title, body, cta_*, target_user_id optionnel). Preview avant envoi.

## Logique de redirection

```typescript
function handleNotifClick(n: Notification) {
  markAsRead(n.id);  // optimistic + sync
  switch (n.cta_target) {
    case 'article':  navigate(`/blog/${n.metadata.slug}`); break;
    case 'video':    navigate(`/blog/videos#${n.metadata.video_id}`); break;
    case 'external': window.open(n.cta_url, '_blank', 'noopener,noreferrer'); break;
    case 'message':  openMessage(n.metadata.message_id); break;
    case 'none':     return;
  }
}
```

## Marquage lu

- Un message est lu ⇔ `message_reads` contient `(message_id, auth.uid())`.
- Une notif est lue ⇔ `notification_reads` contient `(notification_id, auth.uid())`.
- Clic sur un item = lu (synonyme).
- Bouton "Tout marquer comme lu" = batch insert en une fois.
- Compteur non-lu = `count(*) - count(reads)` calculé côté serveur via vue SQL.

## Routes

- Ajout `/inbox` dans `app/routes.tsx` → page d'archivage complète (pour vieux messages, hors widget).
- Pas de nouvelle route admin (intégré à `AdminLayout`).

## Modifications fichiers existants

| Fichier | Changement |
|---------|-----------|
| `src/components/portfolio/Header.tsx` | Brancher Popovers sur Bell/Mail, badges |
| `src/app/routes.tsx` | Ajouter `/inbox` |
| `src/pages/admin/AdminLayout.tsx` | Onglets Messages + Notifications |
| `src/integrations/supabase/types.ts` | Regen via `supabase gen types` |

## Validation

Système considéré fini quand :

1. Admin peut créer un message et l'envoyer
2. Admin peut broadcaster une notif (tous ou ciblé)
3. User connecté voit badge rouge sur Bell et Mail
4. Clic sur un item marque lu et décrémente le badge
5. Realtime : second onglet reçoit instantanément
6. Drawer de message s'ouvre, CTA redirige correctement
7. `npx tsc --noEmit` passe à 0

## Dette acceptée (ponytail)

- Max 50 items chargés dans les popovers (pas de pagination user-side)
- Pas d'archivage côté admin (delete = hard delete)
- Realtime fallback polling 60s, pas de reconnect intelligent
- Pas de typing indicator / présence (hors scope, broadcast unidirectionnel)
- Pas de tests automatisés (pas de framework configuré dans AGENTS.md)

## Hors scope (YAGNI)

- Système de DM user-to-user
- Marquage "favoris" / "archive personnelle"
- Snooze de notifications
- Push browser (PWA)
- Recherche full-text dans la boîte
- Threads / réponses sur un message

## Estimation

~15 fichiers créés, ~800 lignes au total. Validation finale = `npx tsc --noEmit` + smoke test manuel (admin → user → realtime).
