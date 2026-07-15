import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Header, ProfileSection, ProjectTabs, ProjectGrid } from '../components/portfolio';
import { CursorProvider, Cursor } from '../components/portfolio/AnimatedCursor';
import { usePortfolioStore } from '../store/portfolio';

const tabContent: Record<string, React.ReactNode> = {
  travaux: <ProjectGrid />,
  moodboards: (
    <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8, fontSize: '1.1rem' }}>
      Moodboards à venir
    </Typography>
  ),
  jaime: (
    <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8, fontSize: '1.1rem' }}>
      Contenu liké à venir
    </Typography>
  ),
  apropos: (
    <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 8, fontSize: '1.1rem' }}>
      À propos à venir
    </Typography>
  ),
};

export function PortfolioHome() {
  const activeTab = usePortfolioStore((s) => s.activeTab);
  const tabs = ['travaux', 'moodboards', 'jaime', 'apropos'];
  const currentTab = tabs[activeTab] || 'travaux';

  return (
    <CursorProvider>
      <Cursor />
      <Box sx={{ position: 'relative', minHeight: '100vh', pb: 10, overflowX: 'hidden' }}>
        <div className="page-bg-gradient" />
        <Container maxWidth="xl" sx={{ pt: 2, px: { xs: 3, md: 8 } }}>
          <Header />
          <ProfileSection />
          <ProjectTabs />
          {tabContent[currentTab]}
        </Container>
      </Box>
    </CursorProvider>
  );
}
