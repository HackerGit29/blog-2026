import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Container } from '@mui/material';
import { DarkMode, LightMode, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useUIStore } from '../../app/providers';

export function BlogNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useParams<{ user: string }>();
  const { mode, toggleMode } = useUIStore();
  const base = `/${user ?? 'admin'}`;

  const navItems = [
    { label: 'Blog', path: `${base}/blog` },
    { label: 'Tutoriels', path: `${base}/videos` },
  ];

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 70 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(base)}>
            {/* Logo/Title intentionally removed per user request */}
          </Box>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {navItems.map((item) => (
              <Button 
                key={item.path} 
                color="inherit" 
                onClick={() => navigate(item.path)}
                sx={{ 
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  opacity: location.pathname === item.path ? 1 : 0.7,
                  '&:hover': { opacity: 1, bgcolor: 'transparent' }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={toggleMode} color="inherit">
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
            <IconButton sx={{ display: { xs: 'block', md: 'none' } }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
