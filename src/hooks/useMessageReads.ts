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
        .select('id');
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
