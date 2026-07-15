import React from 'react';
import { Box, Container } from '@mui/material';
import { Header, ProfileSection, ProjectTabs, ProjectGrid } from '../components';

export function PortfolioPage() {
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', pb: 10, overflowX: 'hidden' }}>
      {/* Background Gradient Layer */}
      <div className="page-bg-gradient" />
      
      <Container maxWidth="xl" sx={{ pt: 2, px: { xs: 3, md: 8 } }}>
        <Header />
        <ProfileSection />
        <ProjectTabs />
        <ProjectGrid />
      </Container>
    </Box>
  );
}
