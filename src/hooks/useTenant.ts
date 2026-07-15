import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export function useTenant() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['tenant_profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user,
  });

  return {
    tenantId: user?.id || null,
    isVerified: (profile as any)?.is_verified || false,
    profile,
    isLoading,
  };
}
