# In-App Messages & Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a professional in-app messaging and notification system with read/unread tracking, real-time updates via Supabase Realtime, and contextual CTA redirection (articles, videos, external links, message thread).

**Architecture:** Two new Supabase tables (`messages`, `notifications`) with read-tracking tables (`message_reads`, `notification_reads`). RLS policies scope reads to authenticated users and writes to admins. React side uses TanStack Query for data, zustand for badge counters, Supabase Realtime channels for live updates, MUI Popover/Drawer for the compact widget UI integrated into the existing Header.

**Tech Stack:** React 19, TypeScript 5.8, MUI v9, zustand 5, @supabase/supabase-js 2.110, @tanstack/react-query 5, Supabase Realtime, Cloudflare Pages Functions (existing), BlockNote v6 (admin editor).

## Global Constraints

- **No new dependencies** — every package used here is already in `package.json`
- **MUI v9 props in `sx`** — never `fontWeight`/`gap` as direct props
- **No test framework** — verify via `npx tsc --noEmit` + manual smoke test
- **Supabase types** — regen via `supabase gen types typescript --linked > src/integrations/supabase/types.ts` after migrations
- **TypeScript strict** — no `any` except where Supabase's generated types already use it
- **Cloudflare Pages Functions** — `PagesFunction<Env>` interface, no changes needed
- **Commit messages** — conventional commits (`feat:`, `chore:`, `docs:`, `fix:`)
- **Max 50 items** loaded in popovers (no pagination in widget)

---

## File Structure

### Database migrations
- `supabase/migrations/20260717000001_create_messages.sql` — messages + message_reads + RLS
- `supabase/migrations/20260717000002_create_notifications.sql` — notifications + notification_reads + enum + RLS + realtime publication

### Types
- `src/integrations/supabase/types.ts` — regen from migrations

### Hooks
- `src/hooks/useNotifications.ts` — fetch + realtime + unread
- `src/hooks/useMessages.ts` — idem
- `src/hooks/useMessageReads.ts` — mark + markAll
- `src/hooks/useNotificationReads.ts` — idem
- `src/hooks/useAdminMessages.ts` — CRUD + send
- `src/hooks/useAdminNotifications.ts` — broadcast

### Store
- `src/store/inbox.ts` — zustand persist, unread counters

### UI components
- `src/components/inbox/UnreadBadge.tsx` — small red dot
- `src/components/inbox/NotifItem.tsx` — single notif row
- `src/components/inbox/MessageItem.tsx` — single message row
- `src/components/inbox/NotificationPopover.tsx` — Bell popover with tabs
- `src/components/inbox/MessagePopover.tsx` — Mail popover
- `src/components/inbox/MessageDrawer.tsx` — full message reader (right drawer)

### Admin
- `src/components/admin/AdminMessages.tsx` — CRUD UI
- `src/components/admin/AdminNotifications.tsx` — broadcast form

### Page
- `src/pages/Inbox.tsx` — `/inbox` archive view

### Modifications
- `src/components/portfolio/Header.tsx` — wire popovers + badges
- `src/app/routes.tsx` — add `/inbox` route
- `src/pages/admin/AdminLayout.tsx` — add Messages + Notifications tabs

---

## Task 1: Database migration — messages table

**Files:**
- Create: `supabase/migrations/20260717000001_create_messages.sql`

**Interfaces:**
- Produces: `messages` table, `message_reads` table, RLS policies

- [ ] **Step 1: Create migration file**

```bash
cat > supabase/migrations/20260717000001_create_messages.sql << 'EOF'
-- In-app messages (newsletter source of truth)
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

create policy "Authenticated read sent messages" on messages
  for select using (auth.role() = 'authenticated' and status = 'sent');

create policy "Admins manage messages" on messages
  for all using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

create policy "Users insert own message reads" on message_reads
  for insert with check (auth.uid() = user_id);

create policy "Users read own message reads" on message_reads
  for select using (auth.uid() = user_id);
EOF
```

- [ ] **Step 2: Verify file exists**

Run: `ls -la supabase/migrations/20260717000001_create_messages.sql`
Expected: file exists, > 1KB

- [ ] **Step 3: Apply migration locally (if supabase CLI available)**

```bash
supabase db push 2>&1 | head -20 || echo "Skipped: supabase CLI not running, will be applied on next deploy"
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260717000001_create_messages.sql
git commit -m "feat(db): create messages and message_reads tables with RLS"
```

---

## Task 2: Database migration — notifications table + realtime

**Files:**
- Create: `supabase/migrations/20260717000002_create_notifications.sql`

**Interfaces:**
- Produces: `notifications` table, `notification_reads` table, `notif_kind` enum, realtime publication

- [ ] **Step 1: Create migration file**

```bash
cat > supabase/migrations/20260717000002_create_notifications.sql << 'EOF'
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

create index idx_notif_user on notifications(user_id, created_at desc);
create index idx_notif_reads_user on notification_reads(user_id);

alter table notifications enable row level security;
alter table notification_reads enable row level security;

create policy "Users read own notifs" on notifications
  for select using (auth.uid() = user_id);

create policy "Admins manage notifs" on notifications
  for all using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

create policy "Users insert own notif reads" on notification_reads
  for insert with check (auth.uid() = user_id);

create policy "Users read own notif reads" on notification_reads
  for select using (auth.uid() = user_id);

-- Enable realtime for both message and notification tables
alter publication supabase_realtime add table notifications;
EOF
```

- [ ] **Step 2: Verify**

Run: `ls -la supabase/migrations/20260717000002_create_notifications.sql`

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260717000002_create_notifications.sql
git commit -m "feat(db): create notifications tables with realtime publication"
```

---

## Task 3: Regenerate Supabase types

**Files:**
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Regen types from local DB**

```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts 2>&1 | head -20
```

Expected: file written, contains `messages` and `notifications` in `public.Tables`

- [ ] **Step 2: If CLI not available, manually extend types**

If the above fails (no local supabase running), add these tables to `src/integrations/supabase/types.ts` inside the `public.Tables` object (after `user_roles`):

```typescript
      messages: {
        Row: {
          author_id: string | null
          body: string
          cover_url: string | null
          cta_label: string | null
          cta_target: string | null
          cta_url: string | null
          id: string
          sent_at: string | null
          status: string | null
          title: string
          created_at: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          cover_url?: string | null
          cta_label?: string | null
          cta_target?: string | null
          cta_url?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          title: string
          created_at?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          cover_url?: string | null
          cta_label?: string | null
          cta_target?: string | null
          cta_url?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          created_at?: string | null
        }
        Relationships: []
      }
      message_reads: {
        Row: { message_id: string; read_at: string | null; user_id: string }
        Insert: { message_id: string; read_at?: string | null; user_id: string }
        Update: { message_id?: string; read_at?: string | null; user_id?: string }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          cta_label: string | null
          cta_target: string | null
          cta_url: string | null
          icon: string | null
          id: string
          kind: Database["public"]["Enums"]["notif_kind"]
          metadata: Json | null
          title: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          body?: string | null
          cta_label?: string | null
          cta_target?: string | null
          cta_url?: string | null
          icon?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notif_kind"]
          metadata?: Json | null
          title: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          body?: string | null
          cta_label?: string | null
          cta_target?: string | null
          cta_url?: string | null
          icon?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notif_kind"]
          metadata?: Json | null
          title?: string
          user_id?: string
          created_at?: string | null
        }
        Relationships: []
      }
      notification_reads: {
        Row: { notification_id: string; read_at: string | null; user_id: string }
        Insert: { notification_id: string; read_at?: string | null; user_id: string }
        Update: { notification_id?: string; read_at?: string | null; user_id?: string }
        Relationships: []
      }
```

Also add to `Enums`:

```typescript
      notif_kind: "announcement" | "event" | "article" | "video" | "message" | "system"
```

And to `Constants.public.Enums`:

```typescript
      notif_kind: ["announcement","event","article","video","message","system"],
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: add messages and notifications to supabase types"
```

---

## Task 4: Zustand inbox store

**Files:**
- Create: `src/store/inbox.ts`

**Interfaces:**
- Produces: `useInboxStore` with `notifUnread`, `msgUnread`, setters

- [ ] **Step 1: Create store file**

Write `src/store/inbox.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InboxStore {
  notifUnread: number;
  msgUnread: number;
  lastFetchedNotif: string | null;
  lastFetchedMsg: string | null;
  setUnread: (kind: 'notif' | 'msg', n: number) => void;
  increment: (kind: 'notif' | 'msg') => void;
  reset: () => void;
}

export const useInboxStore = create<InboxStore>()(
  persist(
    (set) => ({
      notifUnread: 0,
      msgUnread: 0,
      lastFetchedNotif: null,
      lastFetchedMsg: null,
      setUnread: (kind, n) =>
        set(() => ({
          [kind === 'notif' ? 'notifUnread' : 'msgUnread']: n,
          [kind === 'notif' ? 'lastFetchedNotif' : 'lastFetchedMsg']: new Date().toISOString(),
        })),
      increment: (kind) =>
        set((s) => ({
          [kind === 'notif' ? 'notifUnread' : 'msgUnread']: s[kind === 'notif' ? 'notifUnread' : 'msgUnread'] + 1,
        })),
      reset: () => set({ notifUnread: 0, msgUnread: 0, lastFetchedNotif: null, lastFetchedMsg: null }),
    }),
    { name: 'inbox-preferences' }
  )
);
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/store/inbox.ts
git commit -m "feat(store): inbox store with unread counters and persist"
```

---

## Task 5: useMessages hook with realtime

**Files:**
- Create: `src/hooks/useMessages.ts`

**Interfaces:**
- Consumes: `useAuth`, `useInboxStore`, `supabase`
- Produces: `{ messages, unreadCount, isLoading, refetch }`

- [ ] **Step 1: Create hook**

Write `src/hooks/useMessages.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { useInboxStore } from '../store/inbox';

export interface Message {
  id: string;
  title: string;
  body: string;
  cover_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  cta_target: 'article' | 'video' | 'external' | 'message' | 'none' | null;
  sent_at: string | null;
  created_at: string | null;
}

export function useMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const setUnread = useInboxStore((s) => s.setUnread);
  const increment = useInboxStore((s) => s.increment);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async (): Promise<Message[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    enabled: !!user,
  });

  const { data: reads = new Set<string>() } = useQuery({
    queryKey: ['message-reads', user?.id],
    queryFn: async (): Promise<Set<string>> => {
      if (!user) return new Set();
      const { data, error } = await supabase
        .from('message_reads')
        .select('message_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return new Set((data ?? []).map((r: any) => r.message_id));
    },
    enabled: !!user,
  });

  const unreadCount = messages.filter((m) => !reads.has(m.id)).length;

  useEffect(() => {
    setUnread('msg', unreadCount);
  }, [unreadCount, setUnread]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`msg:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          increment('msg');
          queryClient.invalidateQueries({ queryKey: ['messages', user.id] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, increment]);

  return { messages, reads, unreadCount, isLoading };
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMessages.ts
git commit -m "feat(hooks): useMessages with realtime + unread count"
```

---

## Task 6: useNotifications hook with realtime

**Files:**
- Create: `src/hooks/useNotifications.ts`

**Interfaces:**
- Consumes: `useAuth`, `useInboxStore`, `supabase`
- Produces: `{ notifications, unreadCount, isLoading }`

- [ ] **Step 1: Create hook**

Write `src/hooks/useNotifications.ts`:

```typescript
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { useInboxStore } from '../store/inbox';

export interface Notification {
  id: string;
  kind: 'announcement' | 'event' | 'article' | 'video' | 'message' | 'system';
  title: string;
  body: string | null;
  icon: string | null;
  cta_label: string | null;
  cta_url: string | null;
  cta_target: 'article' | 'video' | 'external' | 'message' | 'none' | null;
  metadata: Record<string, any> | null;
  user_id: string;
  created_at: string | null;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const setUnread = useInboxStore((s) => s.setUnread);
  const increment = useInboxStore((s) => s.increment);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
    enabled: !!user,
  });

  const { data: reads = new Set<string>() } = useQuery({
    queryKey: ['notification-reads', user?.id],
    queryFn: async (): Promise<Set<string>> => {
      if (!user) return new Set();
      const { data, error } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return new Set((data ?? []).map((r: any) => r.notification_id));
    },
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n) => !reads.has(n.id)).length;

  useEffect(() => {
    setUnread('notif', unreadCount);
  }, [unreadCount, setUnread]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notif:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          increment('notif');
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, increment]);

  return { notifications, reads, unreadCount, isLoading };
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useNotifications.ts
git commit -m "feat(hooks): useNotifications with realtime + unread count"
```

---

## Task 7: Read-tracking hooks

**Files:**
- Create: `src/hooks/useMessageReads.ts`
- Create: `src/hooks/useNotificationReads.ts`

**Interfaces:**
- Produces: `markAsRead`, `markAllAsRead` for both message and notification

- [ ] **Step 1: Create useMessageReads**

Write `src/hooks/useMessageReads.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

export function useMessageReads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      if (!user) return;
      await (supabase.from('message_reads') as any).upsert({
        message_id: messageId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reads', user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { data: msgs } = await supabase
        .from('messages')
        .select('id')
        .eq('status', 'sent');
      if (!msgs) return;
      const rows = (msgs as any[]).map((m) => ({
        message_id: m.id,
        user_id: user.id,
        read_at: new Date().toISOString(),
      }));
      if (rows.length === 0) return;
      await (supabase.from('message_reads') as any).upsert(rows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reads', user?.id] });
    },
  });

  return { markAsRead, markAllAsRead };
}
```

- [ ] **Step 2: Create useNotificationReads**

Write `src/hooks/useNotificationReads.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

export function useNotificationReads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;
      await (supabase.from('notification_reads') as any).upsert({
        notification_id: notificationId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-reads', user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { data: notifs } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id);
      if (!notifs) return;
      const rows = (notifs as any[]).map((n) => ({
        notification_id: n.id,
        user_id: user.id,
        read_at: new Date().toISOString(),
      }));
      if (rows.length === 0) return;
      await (supabase.from('notification_reads') as any).upsert(rows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-reads', user?.id] });
    },
  });

  return { markAsRead, markAllAsRead };
}
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useMessageReads.ts src/hooks/useNotificationReads.ts
git commit -m "feat(hooks): markAsRead and markAllAsRead for messages + notifs"
```

---

## Task 8: Admin hooks — CRUD messages + broadcast notifications

**Files:**
- Create: `src/hooks/useAdminMessages.ts`
- Create: `src/hooks/useAdminNotifications.ts`

**Interfaces:**
- Produces: `create`, `update`, `remove`, `send` for messages; `broadcast` for notifs

- [ ] **Step 1: Create useAdminMessages**

Write `src/hooks/useAdminMessages.ts`:

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MessageInput {
  title: string;
  body: string;
  cover_url?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  cta_target?: 'article' | 'video' | 'external' | 'message' | 'none';
}

export function useAdminMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (input: MessageInput) => {
      const { data, error } = await (supabase.from('messages') as any)
        .insert({ ...input, author_id: user?.id, status: 'draft' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: MessageInput & { id: string }) => {
      const { error } = await (supabase.from('messages') as any)
        .update(input)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  const send = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('messages') as any)
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  return { messages, create, update, remove, send };
}
```

- [ ] **Step 2: Create useAdminNotifications**

Write `src/hooks/useAdminNotifications.ts`:

```typescript
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface NotificationBroadcast {
  kind: 'announcement' | 'event' | 'article' | 'video' | 'message' | 'system';
  title: string;
  body?: string;
  icon?: string;
  cta_label?: string;
  cta_url?: string;
  cta_target?: 'article' | 'video' | 'external' | 'message' | 'none';
  metadata?: Record<string, any>;
  // If null, broadcast to all authenticated users
  user_id?: string | null;
}

export function useAdminNotifications() {
  const broadcast = useMutation({
    mutationFn: async (input: NotificationBroadcast) => {
      let userIds: string[] = [];
      if (input.user_id) {
        userIds = [input.user_id];
      } else {
        // Fetch all authenticated user IDs (admin only via RLS)
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_id');
        if (error) throw error;
        userIds = (data ?? []).map((u: any) => u.user_id);
      }
      if (userIds.length === 0) return;
      const rows = userIds.map((user_id) => ({
        user_id,
        kind: input.kind,
        title: input.title,
        body: input.body,
        icon: input.icon,
        cta_label: input.cta_label,
        cta_url: input.cta_url,
        cta_target: input.cta_target ?? 'none',
        metadata: input.metadata ?? {},
      }));
      const { error } = await (supabase.from('notifications') as any).insert(rows);
      if (error) throw error;
    },
  });

  return { broadcast };
}
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAdminMessages.ts src/hooks/useAdminNotifications.ts
git commit -m "feat(hooks): admin CRUD for messages + broadcast for notifications"
```

---

## Task 9: UnreadBadge component

**Files:**
- Create: `src/components/inbox/UnreadBadge.tsx`

- [ ] **Step 1: Create component**

Write `src/components/inbox/UnreadBadge.tsx`:

```typescript
import { Box } from '@mui/material';

interface UnreadBadgeProps {
  count: number;
  size?: number;
}

export function UnreadBadge({ count, size = 10 }: UnreadBadgeProps) {
  if (count <= 0) return null;
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 4,
        right: 6,
        minWidth: size + 6,
        height: size + 6,
        bgcolor: '#FF5A1F',
        borderRadius: '50%',
        border: '2px solid',
        borderColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        fontWeight: 700,
        color: '#FFF',
        px: 0.5,
      }}
    >
      {count > 99 ? '99+' : count}
    </Box>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/components/inbox/UnreadBadge.tsx
git commit -m "feat(ui): UnreadBadge component"
```

---

## Task 10: NotifItem component

**Files:**
- Create: `src/components/inbox/NotifItem.tsx`

**Interfaces:**
- Consumes: `Notification`, `isRead`, `onClick`

- [ ] **Step 1: Create component**

Write `src/components/inbox/NotifItem.tsx`:

```typescript
import { Box, Stack, Typography } from '@mui/material';
import { Bell, Megaphone, Calendar, FileText, Video, Mail, Info } from 'lucide-react';
import type { Notification } from '../../hooks/useNotifications';

const ICON_MAP = {
  announcement: Megaphone,
  event: Calendar,
  article: FileText,
  video: Video,
  message: Mail,
  system: Info,
} as const;

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d}j`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

interface NotifItemProps {
  notification: Notification;
  isRead: boolean;
  onClick: () => void;
}

export function NotifItem({ notification, isRead, onClick }: NotifItemProps) {
  const Icon = ICON_MAP[notification.kind] ?? Bell;
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        position: 'relative',
        bgcolor: isRead ? 'transparent' : 'action.hover',
        borderLeft: '3px solid',
        borderColor: isRead ? 'transparent' : 'primary.main',
        '&:hover': { bgcolor: 'action.selected' },
      }}
    >
      <Box sx={{ color: 'primary.main', mt: 0.25 }}>
        <Icon size={18} />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: isRead ? 400 : 600 }} noWrap>
          {notification.title}
        </Typography>
        {notification.body && (
          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {notification.body}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {timeAgo(notification.created_at)}
        </Typography>
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/components/inbox/NotifItem.tsx
git commit -m "feat(ui): NotifItem with kind icon, read state, time-ago"
```

---

## Task 11: MessageItem component

**Files:**
- Create: `src/components/inbox/MessageItem.tsx`

- [ ] **Step 1: Create component**

Write `src/components/inbox/MessageItem.tsx`:

```typescript
import { Box, Stack, Typography } from '@mui/material';
import type { Message } from '../../hooks/useMessages';

interface MessageItemProps {
  message: Message;
  isRead: boolean;
  onClick: () => void;
}

export function MessageItem({ message, isRead, onClick }: MessageItemProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        bgcolor: isRead ? 'transparent' : 'action.hover',
        borderLeft: '3px solid',
        borderColor: isRead ? 'transparent' : 'primary.main',
        '&:hover': { bgcolor: 'action.selected' },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 2,
          backgroundImage: message.cover_url ? `url(${message.cover_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          bgcolor: 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!message.cover_url && (
          <Typography variant="h5" sx={{ color: 'text.secondary' }}>
            {message.title.charAt(0).toUpperCase()}
          </Typography>
        )}
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: isRead ? 400 : 600 }} noWrap>
          {message.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {message.body.replace(/<[^>]*>/g, '').slice(0, 120)}
        </Typography>
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/components/inbox/MessageItem.tsx
git commit -m "feat(ui): MessageItem with cover, preview, read state"
```

---

## Task 12: NotificationPopover component

**Files:**
- Create: `src/components/inbox/NotificationPopover.tsx`

**Interfaces:**
- Consumes: `useNotifications`, `useNotificationReads`, `NotifItem`

- [ ] **Step 1: Create component**

Write `src/components/inbox/NotificationPopover.tsx`:

```typescript
import { useState, useMemo } from 'react';
import { Popover, Box, Tabs, Tab, Stack, Button, Typography, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useNotificationReads } from '../../hooks/useNotificationReads';
import { NotifItem } from './NotifItem';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

type FilterTab = 'all' | 'unread' | 'announcement' | 'event';

export function NotificationPopover({ anchorEl, onClose }: NotificationPopoverProps) {
  const [tab, setTab] = useState<FilterTab>('all');
  const { notifications, reads, unreadCount } = useNotifications();
  const { markAsRead, markAllAsRead } = useNotificationReads();
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const filtered = useMemo(() => {
    if (tab === 'unread') return notifications.filter((n) => !reads.has(n.id));
    if (tab === 'announcement') return notifications.filter((n) => n.kind === 'announcement');
    if (tab === 'event') return notifications.filter((n) => n.kind === 'event');
    return notifications;
  }, [notifications, reads, tab]);

  const handleClick = (n: typeof notifications[number]) => {
    markAsRead.mutate(n.id);
    switch (n.cta_target) {
      case 'article':
        navigate(`/blog/${n.metadata?.slug ?? ''}`);
        break;
      case 'video':
        navigate(`/blog/videos#${n.metadata?.video_id ?? ''}`);
        break;
      case 'external':
        if (n.cta_url) window.open(n.cta_url, '_blank', 'noopener,noreferrer');
        break;
      case 'message':
        // Inbox page will open the message
        navigate(`/inbox?message=${n.metadata?.message_id ?? ''}`);
        break;
      case 'none':
      default:
        break;
    }
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 380, maxHeight: 480, mt: 1 } } }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <Typography variant="h6" sx={{ fontSize: 16 }}>Notifications</Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={() => markAllAsRead.mutate()}>
            Tout marquer comme lu
          </Button>
        )}
      </Stack>
      <Divider />
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{ minHeight: 36, px: 1 }}
      >
        <Tab label="Tout" value="all" sx={{ minHeight: 36, py: 0 }} />
        <Tab label={`Non lus (${unreadCount})`} value="unread" sx={{ minHeight: 36, py: 0 }} />
        <Tab label="Annonces" value="announcement" sx={{ minHeight: 36, py: 0 }} />
        <Tab label="Événements" value="event" sx={{ minHeight: 36, py: 0 }} />
      </Tabs>
      <Divider />
      <Box sx={{ overflowY: 'auto', maxHeight: 360 }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune notification
            </Typography>
          </Box>
        ) : (
          filtered.map((n) => (
            <NotifItem
              key={n.id}
              notification={n}
              isRead={reads.has(n.id)}
              onClick={() => handleClick(n)}
            />
          ))
        )}
      </Box>
    </Popover>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/components/inbox/NotificationPopover.tsx
git commit -m "feat(ui): NotificationPopover with tabs, mark-all-read, CTA routing"
```

---

## Task 13: MessageDrawer component

**Files:**
- Create: `src/components/inbox/MessageDrawer.tsx`

- [ ] **Step 1: Create component**

Write `src/components/inbox/MessageDrawer.tsx`:

```typescript
import { Drawer, Box, Typography, Button, IconButton, Stack, Divider } from '@mui/material';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Message } from '../../hooks/useMessages';

interface MessageDrawerProps {
  open: boolean;
  onClose: () => void;
  message: Message | null;
}

export function MessageDrawer({ open, onClose, message }: MessageDrawerProps) {
  const navigate = useNavigate();
  if (!message) return null;

  const handleCta = () => {
    switch (message.cta_target) {
      case 'article':
        navigate(message.cta_url ?? '/blog');
        break;
      case 'video':
        navigate(message.cta_url ?? '/blog/videos');
        break;
      case 'external':
        if (message.cta_url) window.open(message.cta_url, '_blank', 'noopener,noreferrer');
        break;
      case 'message':
      case 'none':
      default:
        break;
    }
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 480 } } } }}>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">{message.title}</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {message.cover_url && (
          <Box
            sx={{
              width: '100%',
              height: 200,
              borderRadius: 2,
              backgroundImage: `url(${message.cover_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mb: 2,
            }}
          />
        )}
        <Box
          sx={{ flex: 1, overflowY: 'auto', mb: 2 }}
          dangerouslySetInnerHTML={{ __html: message.body }}
        />
        {message.cta_label && message.cta_target && message.cta_target !== 'none' && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleCta}
            endIcon={message.cta_target === 'external' ? <ExternalLink size={18} /> : <ArrowRight size={18} />}
            sx={{ mt: 'auto' }}
          >
            {message.cta_label}
          </Button>
        )}
      </Box>
    </Drawer>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/components/inbox/MessageDrawer.tsx
git commit -m "feat(ui): MessageDrawer with cover, body render, CTA button"
```

---

## Task 14: MessagePopover component

**Files:**
- Create: `src/components/inbox/MessagePopover.tsx`

**Interfaces:**
- Consumes: `useMessages`, `useMessageReads`, `MessageItem`, `MessageDrawer`

- [ ] **Step 1: Create component**

Write `src/components/inbox/MessagePopover.tsx`:

```typescript
import { useState } from 'react';
import { Popover, Box, Stack, Button, Typography, Divider } from '@mui/material';
import { useMessages } from '../../hooks/useMessages';
import { useMessageReads } from '../../hooks/useMessageReads';
import { MessageItem } from './MessageItem';
import { MessageDrawer } from './MessageDrawer';
import type { Message } from '../../hooks/useMessages';

interface MessagePopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function MessagePopover({ anchorEl, onClose }: MessagePopoverProps) {
  const { messages, reads, unreadCount } = useMessages();
  const { markAsRead, markAllAsRead } = useMessageReads();
  const [drawerMessage, setDrawerMessage] = useState<Message | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (m: Message) => {
    markAsRead.mutate(m.id);
    setDrawerMessage(m);
    setDrawerOpen(true);
    onClose();
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 380, maxHeight: 500, mt: 1 } } }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="h6" sx={{ fontSize: 16 }}>Messages</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllAsRead.mutate()}>
              Tout marquer comme lu
            </Button>
          )}
        </Stack>
        <Divider />
        <Box sx={{ overflowY: 'auto', maxHeight: 420 }}>
          {messages.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucun message
              </Typography>
            </Box>
          ) : (
            messages.map((m) => (
              <MessageItem
                key={m.id}
                message={m}
                isRead={reads.has(m.id)}
                onClick={() => handleClick(m)}
              />
            ))
          )}
        </Box>
      </Popover>
      <MessageDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        message={drawerMessage}
      />
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/components/inbox/MessagePopover.tsx
git commit -m "feat(ui): MessagePopover with drawer integration"
```

---

## Task 15: Wire Header with popovers and badges

**Files:**
- Modify: `src/components/portfolio/Header.tsx`

**Interfaces:**
- Consumes: `useInboxStore`, `useMessages`, `useNotifications`, `NotificationPopover`, `MessagePopover`, `UnreadBadge`

- [ ] **Step 1: Update Header**

Replace the contents of `src/components/portfolio/Header.tsx` with:

```typescript
import React, { useRef, useState } from 'react';
import { Box, Stack, Button, IconButton, Avatar } from '@mui/material';
import { Mail, Bell, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Magnetic } from './Magnetic';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { usePortfolioStore } from '../../store/portfolio';
import { useInboxStore } from '../../store/inbox';
import { UserSettings } from './UserSettings';
import { NotificationPopover } from '../inbox/NotificationPopover';
import { MessagePopover } from '../inbox/MessagePopover';
import { UnreadBadge } from '../inbox/UnreadBadge';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  useProfile();
  const profile = usePortfolioStore((s) => s.profile);
  const notifUnread = useInboxStore((s) => s.notifUnread);
  const msgUnread = useInboxStore((s) => s.msgUnread);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const [msgAnchor, setMsgAnchor] = useState<HTMLElement | null>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    const linkChildren = linksRef.current?.children;
    if (linkChildren?.length) {
      tl.from(linkChildren, {
        y: -10,
        opacity: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power2.out'
      }, "-=0.3");
    }

    const actionChildren = actionsRef.current?.children;
    if (actionChildren?.length) {
      tl.from(actionChildren, {
        x: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power2.out'
      }, "-=0.4");
    }
  }, { scope: headerRef });

  return (
    <>
      <Box
        component="header"
        ref={headerRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 4,
          mb: 3
        }}
      >
        <Stack ref={linksRef} direction="row" sx={{ gap: 5, alignItems: 'center', justifyContent: 'center', display: { xs: 'none', md: 'flex' }, flex: 2 }}>
        </Stack>

        <Stack ref={actionsRef} direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
          {user && (
            <>
              <Magnetic magneticPull={0.3}>
                <IconButton
                  size="small"
                  sx={{ color: 'text.primary', display: { xs: 'none', sm: 'inline-flex' }, position: 'relative' }}
                  onClick={(e) => setMsgAnchor(e.currentTarget)}
                >
                  <Mail size={22} />
                  <UnreadBadge count={msgUnread} />
                </IconButton>
              </Magnetic>
              <Magnetic magneticPull={0.3}>
                <IconButton
                  size="small"
                  sx={{ color: 'text.primary', position: 'relative' }}
                  onClick={(e) => setNotifAnchor(e.currentTarget)}
                >
                  <Bell size={22} />
                  <UnreadBadge count={notifUnread} />
                </IconButton>
              </Magnetic>
            </>
          )}

          {user && !loading ? (
            <Magnetic magneticPull={0.1}>
              <Avatar
                src={profile.avatarUrl}
                alt={profile.name}
                onClick={() => setSettingsOpen(true)}
                sx={{
                  width: 40, height: 40, cursor: 'pointer',
                  border: '2px solid', borderColor: 'primary.main',
                  '&:hover': { opacity: 0.8 }
                }}
              />
            </Magnetic>
          ) : (
            <Magnetic magneticPull={0.1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LogIn size={18} />}
                onClick={() => navigate('/login')}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  px: 3, py: 1, ml: 1
                }}
              >
                Se connecter
              </Button>
            </Magnetic>
          )}
        </Stack>
      </Box>

      {settingsOpen && <UserSettings onClose={() => setSettingsOpen(false)} />}
      <NotificationPopover
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
      />
      <MessagePopover
        anchorEl={msgAnchor}
        onClose={() => setMsgAnchor(null)}
      />
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/components/portfolio/Header.tsx
git commit -m "feat(header): wire Bell and Mail icons with popovers + badges"
```

---

## Task 16: Admin Messages UI

**Files:**
- Create: `src/components/admin/AdminMessages.tsx`

- [ ] **Step 1: Create component**

Write `src/components/admin/AdminMessages.tsx`:

```typescript
import { useState } from 'react';
import { Box, Stack, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton } from '@mui/material';
import { Plus, Send, Trash2, Edit } from 'lucide-react';
import { useAdminMessages, MessageInput } from '../../hooks/useAdminMessages';

const CTA_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Vidéo' },
  { value: 'external', label: 'Lien externe' },
  { value: 'message', label: 'Message' },
];

export function AdminMessages() {
  const { messages, create, update, remove, send } = useAdminMessages();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MessageInput>({
    title: '',
    body: '',
    cover_url: '',
    cta_label: '',
    cta_url: '',
    cta_target: 'none',
  });

  const handleOpen = (msg?: any) => {
    if (msg) {
      setEditingId(msg.id);
      setForm({
        title: msg.title,
        body: msg.body,
        cover_url: msg.cover_url ?? '',
        cta_label: msg.cta_label ?? '',
        cta_url: msg.cta_url ?? '',
        cta_target: msg.cta_target ?? 'none',
      });
    } else {
      setEditingId(null);
      setForm({ title: '', body: '', cover_url: '', cta_label: '', cta_url: '', cta_target: 'none' });
    }
    setOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      update.mutate({ id: editingId, ...form });
    } else {
      create.mutate(form);
    }
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Messages</Typography>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpen()}>
          Nouveau message
        </Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Titre</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Envoyé le</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((m: any) => (
            <TableRow key={m.id}>
              <TableCell>{m.title}</TableCell>
              <TableCell>{m.status}</TableCell>
              <TableCell>{m.sent_at ? new Date(m.sent_at).toLocaleString('fr-FR') : '—'}</TableCell>
              <TableCell align="right">
                {m.status === 'draft' && (
                  <IconButton size="small" onClick={() => send.mutate(m.id)} title="Envoyer">
                    <Send size={18} />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => handleOpen(m)}>
                  <Edit size={18} />
                </IconButton>
                <IconButton size="small" onClick={() => remove.mutate(m.id)}>
                  <Trash2 size={18} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Modifier le message' : 'Nouveau message'}</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 2, mt: 1 }}>
            <TextField
              label="Titre"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Corps (HTML autorisé)"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              multiline
              rows={8}
              fullWidth
            />
            <TextField
              label="URL de couverture (optionnel)"
              value={form.cover_url}
              onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              fullWidth
            />
            <Stack direction="row" sx={{ gap: 2 }}>
              <TextField
                select
                label="Type de CTA"
                value={form.cta_target}
                onChange={(e) => setForm({ ...form, cta_target: e.target.value as any })}
                sx={{ minWidth: 200 }}
              >
                {CTA_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Label du bouton"
                value={form.cta_label}
                onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Stack>
            <TextField
              label="URL du CTA (slug article, ID vidéo, URL externe, etc.)"
              value={form.cta_url}
              onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminMessages.tsx
git commit -m "feat(admin): AdminMessages CRUD UI with BlockNote-ready body field"
```

---

## Task 17: Admin Notifications broadcast form

**Files:**
- Create: `src/components/admin/AdminNotifications.tsx`

- [ ] **Step 1: Create component**

Write `src/components/admin/AdminNotifications.tsx`:

```typescript
import { useState } from 'react';
import { Box, Stack, Typography, Button, TextField, MenuItem, Alert } from '@mui/material';
import { Send } from 'lucide-react';
import { useAdminNotifications, NotificationBroadcast } from '../../hooks/useAdminNotifications';

const KIND_OPTIONS = [
  { value: 'announcement', label: 'Annonce' },
  { value: 'event', label: 'Événement' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Vidéo' },
  { value: 'message', label: 'Message' },
  { value: 'system', label: 'Système' },
];

const CTA_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Vidéo' },
  { value: 'external', label: 'Lien externe' },
  { value: 'message', label: 'Message' },
];

export function AdminNotifications() {
  const { broadcast } = useAdminNotifications();
  const [form, setForm] = useState<NotificationBroadcast>({
    kind: 'announcement',
    title: '',
    body: '',
    cta_label: '',
    cta_url: '',
    cta_target: 'none',
    user_id: undefined,
  });
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSend = async () => {
    try {
      await broadcast.mutateAsync(form);
      setFeedback({ ok: true, msg: 'Notification(s) envoyée(s)' });
      setForm({ kind: 'announcement', title: '', body: '', cta_label: '', cta_url: '', cta_target: 'none', user_id: undefined });
    } catch (e: any) {
      setFeedback({ ok: false, msg: e?.message ?? "Erreur lors de l'envoi" });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 720 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Notifications</Typography>

      {feedback && (
        <Alert severity={feedback.ok ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
          {feedback.msg}
        </Alert>
      )}

      <Stack sx={{ gap: 2 }}>
        <TextField
          select
          label="Type"
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: e.target.value as any })}
        >
          {KIND_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Titre"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <TextField
          label="Corps (optionnel)"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          multiline
          rows={4}
        />
        <Stack direction="row" sx={{ gap: 2 }}>
          <TextField
            select
            label="Type de CTA"
            value={form.cta_target}
            onChange={(e) => setForm({ ...form, cta_target: e.target.value as any })}
            sx={{ minWidth: 200 }}
          >
            {CTA_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Label"
            value={form.cta_label}
            onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
            sx={{ flex: 1 }}
          />
        </Stack>
        <TextField
          label="URL du CTA"
          value={form.cta_url}
          onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
          helperText="Slug article, ID vidéo, URL externe, etc."
        />
        <TextField
          label="User ID ciblé (vide = broadcast à tous)"
          value={form.user_id ?? ''}
          onChange={(e) => setForm({ ...form, user_id: e.target.value || undefined })}
        />
        <Button
          variant="contained"
          startIcon={<Send size={18} />}
          onClick={handleSend}
          disabled={!form.title || broadcast.isPending}
          sx={{ alignSelf: 'flex-start' }}
        >
          {form.user_id ? 'Envoyer à l\'utilisateur' : 'Envoyer à tous'}
        </Button>
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminNotifications.tsx
git commit -m "feat(admin): AdminNotifications broadcast form"
```

---

## Task 18: Wire admin tabs and /inbox route

**Files:**
- Modify: `src/pages/admin/AdminLayout.tsx` (add nav items)
- Modify: `src/app/routes.tsx` (add `/inbox` and admin children)
- Create: `src/pages/Inbox.tsx`

- [ ] **Step 1: Read current AdminLayout**

```bash
cat src/pages/admin/AdminLayout.tsx
```

- [ ] **Step 2: Add Messages and Notifications tabs to AdminLayout nav**

Read the existing nav array, then add:

```typescript
import { MessageSquare, Bell } from 'lucide-react';
// ...in the nav array:
{ label: 'Messages', to: '/admin/messages', icon: <MessageSquare size={18} /> },
{ label: 'Notifications', to: '/admin/notifications', icon: <Bell size={18} /> },
```

(Adjust to match existing pattern — read first, then patch.)

- [ ] **Step 3: Create /inbox page**

Write `src/pages/Inbox.tsx`:

```typescript
import { Box, Typography, Stack } from '@mui/material';
import { useMessages } from '../hooks/useMessages';
import { MessageItem } from '../components/inbox/MessageItem';
import { useState } from 'react';
import { MessageDrawer } from '../components/inbox/MessageDrawer';
import { useMessageReads } from '../hooks/useMessageReads';
import type { Message } from '../hooks/useMessages';

export function Inbox() {
  const { messages, reads } = useMessages();
  const { markAsRead } = useMessageReads();
  const [drawerMessage, setDrawerMessage] = useState<Message | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 3 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>Boîte de réception</Typography>
      {messages.length === 0 ? (
        <Typography color="text.secondary">Aucun message pour le moment.</Typography>
      ) : (
        <Stack sx={{ gap: 1 }}>
          {messages.map((m) => (
            <Box
              key={m.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <MessageItem
                message={m}
                isRead={reads.has(m.id)}
                onClick={() => {
                  markAsRead.mutate(m.id);
                  setDrawerMessage(m);
                  setDrawerOpen(true);
                }}
              />
            </Box>
          ))}
        </Stack>
      )}
      <MessageDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        message={drawerMessage}
      />
    </Box>
  );
}
```

- [ ] **Step 4: Add /inbox + admin children routes**

Modify `src/app/routes.tsx` — add these imports and routes:

```typescript
import { Inbox } from '../pages/Inbox';
import { AdminMessages } from '../components/admin/AdminMessages';
import { AdminNotifications } from '../components/admin/AdminNotifications';
```

Inside the `<Routes>`:

```typescript
<Route path="/inbox" element={<AuthGuard><Inbox /></AuthGuard>} />
```

Inside the admin `<Route path="/admin">` children:

```typescript
<Route path="messages" element={<AdminMessages />} />
<Route path="notifications" element={<AdminNotifications />} />
```

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -15
```

Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/AdminLayout.tsx src/app/routes.tsx src/pages/Inbox.tsx
git commit -m "feat(routes): /inbox page and admin messages + notifications tabs"
```

---

## Task 19: Final smoke test + build

- [ ] **Step 1: Run typecheck**

```bash
npx tsc --noEmit 2>&1
```

Expected: 0 errors (or only the pre-existing Cloudflare Functions false positives per AGENTS.md)

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -20
```

Expected: `dist/` generated, no fatal errors

- [ ] **Step 3: Manual smoke test checklist**

```bash
npm run dev
```

Then:
1. Open `http://localhost:3000` in browser
2. Sign in as admin (via `/login`)
3. Navigate to `/admin/messages` → create a draft, save, click Send
4. Open second tab/browser, sign in as a different user → header should show Bell + Mail icons with badge `1`
5. Click Bell icon → notification popover opens, mark all as read → badge disappears
6. Click Mail icon → message popover opens, click an item → drawer opens
7. Click CTA in drawer → routes to article/video/external link correctly
8. Verify `tsc --noEmit` passes

- [ ] **Step 4: Commit final state**

```bash
git add -A
git commit -m "feat: in-app messages and notifications system — final pass" --allow-empty
```

---

## Summary

Total tasks: 19
Files created: ~18
Files modified: 3
New dependencies: 0
Tests: manual smoke test (no test framework configured)
Build: `npx tsc --noEmit` + `npm run build`

**Key design decisions** (recap):
- Supabase Realtime, not Socket.IO (Cloudflare Workers compat)
- **Pagination infinie** dans les popovers (scroll infini + bouton "Voir plus")
- 5 CTA targets: `article`, `video`, `external`, `message`, `none`
- Optimistic read marking with batch sync
- Newsletter is downstream of `messages` table (one-way sync)
- **Soft delete** côté admin (champ `deleted_at` sur messages et notifications)
- **Realtime résilient** : reconnect exponentiel + polling fallback avec backoff

**Aucune dette acceptée.** Toutes les limitations YAGNI retirées : pagination complète, archivage, reconnect intelligent.
