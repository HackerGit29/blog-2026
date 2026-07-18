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
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('messages').delete().lt('created_at', sevenDaysAgo);
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
      const { data, error } = await supabase
        .from('messages')
        .insert({ ...input, author_id: user?.id, status: 'sent', sent_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: MessageInput & { id: string }) => {
      const { error } = await supabase
        .from('messages')
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

  return { messages, create, update, remove };
}
