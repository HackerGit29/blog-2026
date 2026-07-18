import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { useInboxStore } from '../store/inbox';
import { playNotificationSound } from '../lib/notificationSound';
import type { CtaTarget } from './useMessages';

export type NotifKind = 'announcement' | 'event' | 'article' | 'video' | 'message' | 'system';

export interface Notification {
  id: string;
  kind: NotifKind;
  title: string;
  body: string | null;
  icon: string | null;
  cta_label: string | null;
  cta_url: string | null;
  cta_target: CtaTarget | null;
  metadata: Record<string, any> | null;
  user_id: string;
  created_at: string | null;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const setUnread = useInboxStore((s) => s.setUnread);
  const increment = useInboxStore((s) => s.increment);

  // Fetch all notifications for the current user (raw, unfiltered)
  const { data: allNotifications = [], isLoading } = useQuery({
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

  // Fetch notification IDs that the user has read
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

  // Fetch notification IDs that the user has explicitly dismissed
  const { data: deletes = new Set<string>() } = useQuery({
    queryKey: ['notification-deletes', user?.id],
    queryFn: async (): Promise<Set<string>> => {
      if (!user) return new Set();
      const { data, error } = await supabase
        .from('notification_deletes')
        .select('notification_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return new Set((data ?? []).map((r: any) => r.notification_id));
    },
    enabled: !!user,
  });

  // Filter: only notifications the user hasn't read or dismissed
  const notifications = allNotifications.filter(
    (n) => !reads.has(n.id) && !deletes.has(n.id)
  );

  const unreadCount = notifications.length;
  const dismissedCount = deletes.size;

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
          playNotificationSound();
          increment('notif');
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, increment]);

  return { notifications, reads, deletes, unreadCount, dismissedCount, isLoading };
}
