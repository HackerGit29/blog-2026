import React from 'react';
import { Box, Typography, Link, Skeleton } from '@mui/material';
import { useTenantResources, TenantResource } from '../../hooks/useTenantResources';

function ResourceLine({ resource }: { resource: TenantResource }) {
  return (
    <Typography
      variant="body1"
      component="p"
      sx={{ lineHeight: 2, color: 'text.secondary' }}
    >
      •{' '}
      <Link
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: '#4FC3F7',
          textDecoration: 'none',
          fontWeight: 500,
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {resource.title}
      </Link>
    </Typography>
  );
}

export function RessourcesTab({ username }: { username?: string }) {
  const { data: resources, isLoading } = useTenantResources(username);

  if (isLoading) {
    return (
      <Box sx={{ py: 2 }}>
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} width="60%" height={28} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="body1" color="text.secondary">
          Aucune ressource disponible pour le moment.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 6 }}>
      {resources.map((resource) => (
        <ResourceLine key={resource.id} resource={resource} />
      ))}
    </Box>
  );
}
