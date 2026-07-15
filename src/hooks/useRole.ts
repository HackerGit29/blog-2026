import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

type AppRole = 'admin' | 'moderator' | 'user' | 'superadmin';

export function useRole() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['user_role_and_profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [roleRes, profileRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_profiles').select('is_verified, is_banned').eq('user_id', user.id).maybeSingle(),
      ]);

      const profile = profileRes.data as { is_verified?: boolean; is_banned?: boolean } | null;
      return {
        role: roleRes.data?.role as AppRole | null,
        isVerified: profile?.is_verified || false,
        isBanned: profile?.is_banned || false,
      };
    },
    enabled: !!user,
  });

  const role = data?.role ?? null;
  const isVerified = data?.isVerified ?? false;
  const isBanned = data?.isBanned ?? false;

  return {
    role,
    isLoading,
    isAdmin: role === 'admin' || role === 'superadmin',
    // superadmin role is a distinct, non-self-elevatable tier
    isSuperAdmin: role === 'superadmin',
    isBanned,
    isVerified,
  };
}
