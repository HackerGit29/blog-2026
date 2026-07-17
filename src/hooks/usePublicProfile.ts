import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import type { ProfileData } from '../store/portfolio';

/**
 * Charge un profil public depuis Supabase par username.
 * Utilisé par la route /:username pour afficher le profil d'un tenant.
 * Charge aussi les données formatées des abonnés (Instagram-style).
 */
export function usePublicProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['public_profile', username],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!username) return null;

      const { data, error } = await supabase
        .from('user_profiles_with_formatted_followers')
        .select('*')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error || !data) return null;

      const d = data as any;
      return {
        name: d.name || 'Utilisateur',
        title: d.title || '',
        location: d.location || '',
        description: d.description || '',
        avatarUrl: d.avatar_url || '',
        followerCount: d.follower_count || 0,
        formattedFollowers: d.formatted_followers || '0',
        socials: d.socials || { discord: '', github: '', instagram: '' },
        isVerified: d.is_verified || false,
        username: d.username || '',
        memberSince: d.created_at || '',
        // Backward compatibility
        followers: d.followers || '0',
        following: d.following || '0',
        likes: d.likes || '0',
      };
    },
    enabled: !!username,
    staleTime: 60 * 1000, // 1 minute (plus court car les followers changent)
  });
}
