import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCanAccessAdmin } from '../../hooks/useCanAccessAdmin';
import { DEFAULT_TENANT } from '../../store/portfolio';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { data: canAccessAdmin, isLoading } = useCanAccessAdmin();

  if (authLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>Vérification des accès...</Typography>
        </Box>
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!canAccessAdmin) return <Navigate to={`/${DEFAULT_TENANT}`} replace />;
  return <>{children}</>;
}
