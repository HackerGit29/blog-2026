import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

/**
 * Hook pour charger le nombre d'abonnés formaté d'un utilisateur
 * Utilise la vue user_profiles_with_formatted_followers pour obtenir le compte formaté
 */
export function useFormattedFollowerCount(username: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!username) return;

    const channel = supabase
      .channel(`followers:${username}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['formatted_followers', username] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username, queryClient]);

  return useQuery({
    queryKey: ['formatted_followers', username],
    queryFn: async () => {
      if (!username) return null;

      const { data, error } = await supabase
        .from('user_profiles_with_formatted_followers')
        .select('formatted_followers, follower_count')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error || !data) return null;
      return data;
    },
    enabled: !!username,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook pour vérifier si l'utilisateur connecté suit un utilisateur spécifique
 */
export function useIsFollowing(followingUsername: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !followingUsername) return;

    const channel = supabase
      .channel(`following:${user.id}:${followingUsername}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['is_following', user.id, followingUsername] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, followingUsername, queryClient]);

  return useQuery({
    queryKey: ['is_following', user?.id, followingUsername],
    queryFn: async () => {
      if (!user || !followingUsername) return false;

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', followingUsername.toLowerCase())
        .maybeSingle();

      if (profileError || !profile) return false;

      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.user_id)
        .maybeSingle();

      return !!data && !error;
    },
    enabled: !!user && !!followingUsername,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook pour suivre/ne plus suivre un utilisateur
 */
export function useFollowUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const follow = useMutation({
    mutationFn: async (followingUsername: string) => {
      if (!user) throw new Error('Non authentifié');

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', followingUsername.toLowerCase())
        .maybeSingle();

      if (profileError || !profile) throw new Error('Utilisateur non trouvé');

      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: profile.user_id,
        });

      if (error) throw error;
      return profile.user_id;
    },
    onMutate: async (followingUsername) => {
      await queryClient.cancelQueries({ queryKey: ['is_following', user?.id, followingUsername] });
      const previous = queryClient.getQueryData(['is_following', user?.id, followingUsername]);
      queryClient.setQueryData(['is_following', user?.id, followingUsername], true);
      return { previous };
    },
    onError: (err, followingUsername, context) => {
      queryClient.setQueryData(['is_following', user?.id, followingUsername], context?.previous);
    },
  });

  const unfollow = useMutation({
    mutationFn: async (followingUsername: string) => {
      if (!user) throw new Error('Non authentifié');

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', followingUsername.toLowerCase())
        .maybeSingle();

      if (profileError || !profile) throw new Error('Utilisateur non trouvé');

      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profile.user_id);

      if (error) throw error;
      return profile.user_id;
    },
    onMutate: async (followingUsername) => {
      await queryClient.cancelQueries({ queryKey: ['is_following', user?.id, followingUsername] });
      const previous = queryClient.getQueryData(['is_following', user?.id, followingUsername]);
      queryClient.setQueryData(['is_following', user?.id, followingUsername], false);
      return { previous };
    },
    onError: (err, followingUsername, context) => {
      queryClient.setQueryData(['is_following', user?.id, followingUsername], context?.previous);
    },
  });

  return { follow, unfollow };
}

/**
 * Hook pour charger la liste des abonnés d'un utilisateur
 */
export function useFollowersList(username: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ['followers_list', username, limit],
    queryFn: async () => {
      if (!username) return [];

      // Résoudre le username en user_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (profileError || !profile) return [];

      // Charger les abonnés
      const { data, error } = await supabase
        .from('followers')
        .select(`
          follower_id,
          created_at,
          follower:follower_id (
            user_id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('following_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour charger la liste des utilisateurs que suit un utilisateur
 */
export function useFollowingList(username: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ['following_list', username, limit],
    queryFn: async () => {
      if (!username) return [];

      // Résoudre le username en user_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (profileError || !profile) return [];

      // Charger les utilisateurs suivis
      const { data, error } = await supabase
        .from('followers')
        .select(`
          following_id,
          created_at,
          following:following_id (
            user_id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('follower_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
