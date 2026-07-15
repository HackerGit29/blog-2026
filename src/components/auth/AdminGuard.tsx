import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useRole();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>Vérification des droits...</Typography>
        </Box>
      </Box>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
