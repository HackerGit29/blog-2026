import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

type AppRole = 'admin' | 'moderator' | 'user';

export function useRole() {
  const { user } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ['user_role', user?.id],
    queryFn: async (): Promise<AppRole | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      if (error) return null;
      return (data as any)?.role as AppRole;
    },
    enabled: !!user,
  });

  return { role, isLoading, isAdmin: role === 'admin' };
}
