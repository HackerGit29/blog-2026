import React from 'react';
import { Box, Container } from '@mui/material';
import { BlogNav } from './BlogNav';

interface BlogLayoutProps {
  children: React.ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BlogNav />
      <Box component="main" sx={{ flexGrow: 1, pt: 8, pb: 12 }}>
        {children}
      </Box>
    </Box>
  );
}
