import React from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, useTheme, Divider } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FileText, BarChart3, Settings, LogOut, LayoutDashboard, Video, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Articles', icon: FileText, path: '/admin/articles' },
  { label: 'Vidéos', icon: Video, path: '/admin/videos' },
  { label: 'Community', icon: Users, path: '/admin/community' },
  { label: 'Paramètres', icon: Settings, path: '/admin/settings' },
];

export function AdminLayout() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            p: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            Admin
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Benji AKA Dev
          </Typography>
        </Box>

        <Divider sx={{ mx: 2, mb: 2 }} />

        <List sx={{ flex: 1, px: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  <item.icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 } } }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ mx: 2, mb: 1 }} />

        <ListItemButton onClick={handleLogout} sx={{ borderRadius: '12px', px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 500 } } }} />
        </ListItemButton>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: { xs: 3, md: 5 }, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
