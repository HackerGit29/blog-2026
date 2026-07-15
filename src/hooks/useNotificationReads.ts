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
