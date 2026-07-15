import { useMutation } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import type { CtaTarget } from './useMessages';
import type { NotifKind } from './useNotifications';

export interface NotificationBroadcast {
  kind: NotifKind;
  title: string;
  body?: string;
  icon?: string;
  cta_label?: string;
  cta_url?: string;
  cta_target?: CtaTarget;
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
