import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { PortfolioHome } from '../../pages/PortfolioHome';

/**
 * RootRedirect — gère la route racine `/`.
 * - Si l'utilisateur est authentifié → redirige vers /:username (son profil public).
 * - Si non connecté → affiche le PortfolioHome par défaut (données du store).
 */
export function RootRedirect() {
  const { user, loading: authLoading } = useAuth();

  // Récupère le username de l'utilisateur connecté pour la redirection
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my_profile_username', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  if (authLoading || (user && profileLoading)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user && profile?.username) {
    return <Navigate to={`/${profile.username}`} replace />;
  }

  // Visiteur non authentifié → affiche le profil par défaut du store
  return <PortfolioHome />;
}
