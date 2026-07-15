import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';

/**
 * SuperAdminGuard — protège les routes réservées aux superadmins.
 * Un superadmin est un admin avec is_verified = true dans user_profiles.
 * Les admins ordinaires sont redirigés vers /admin.
 */
export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, isLoading } = useRole();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Vérification des droits superadmin...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
