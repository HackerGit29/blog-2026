import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

export function useCanAccessAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can_access_admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('user_profiles')
        .select('can_access_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      return data?.can_access_admin === true;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}
