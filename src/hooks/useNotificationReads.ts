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

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return;
      // Record the dismissal in notification_deletes only.
      // The notification row remains (handled by RLS + cleanup function);
      // the UI filter in useNotifications excludes dismissed IDs.
      await (supabase.from('notification_deletes') as any).upsert({
        user_id: user.id,
        notification_id: notificationId,
        deleted_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notification-reads', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notification-deletes', user?.id] });
    },
  });

  const deleteAllNotifications = useMutation({
    mutationFn: async () => {
      if (!user) return;
      // Fetch all notification IDs for this user
      const { data: notifs } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id);
      if (!notifs || notifs.length === 0) return;

      const now = new Date().toISOString();
      // Record all dismissals in notification_deletes only
      const rows = (notifs as any[]).map((n) => ({
        user_id: user.id,
        notification_id: n.id,
        deleted_at: now,
      }));
      await (supabase.from('notification_deletes') as any).upsert(rows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notification-reads', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notification-deletes', user?.id] });
    },
  });

  return { markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications };
}
