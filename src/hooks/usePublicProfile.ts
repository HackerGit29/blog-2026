import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import type { ProfileData } from '../store/portfolio';

/**
 * Charge un profil public depuis Supabase par username.
 * Utilisé par la route /:username pour afficher le profil d'un tenant.
 */
export function usePublicProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['public_profile', username],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!username) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error || !data) return null;

      const d = data as any;
      return {
        name: d.name || 'Utilisateur',
        title: d.title || '',
        location: d.location || '',
        avatarUrl: d.avatar_url || '',
        followers: d.followers || '0',
        following: d.following || '0',
        likes: d.likes || '0',
        socials: d.socials || { discord: '', github: '', instagram: '' },
        isVerified: d.is_verified || false,
        username: d.username || '',
      };
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
}
