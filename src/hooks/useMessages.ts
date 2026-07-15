import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { useInboxStore } from '../store/inbox';

export type CtaTarget = 'article' | 'video' | 'external' | 'message' | 'none';

export interface Message {
  id: string;
  title: string;
  body: string;
  cover_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  cta_target: CtaTarget | null;
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
