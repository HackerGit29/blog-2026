import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { useInboxStore } from '../store/inbox';
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
