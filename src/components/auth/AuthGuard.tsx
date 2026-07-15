import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
