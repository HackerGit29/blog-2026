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
