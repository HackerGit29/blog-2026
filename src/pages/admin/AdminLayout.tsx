import { useState } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Settings, LogOut, LayoutDashboard, Video, Users, ShieldCheck, MessageSquare, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { usePortfolioStore, DEFAULT_TENANT } from '../../store/portfolio';

const DRAWER_WIDTH = 256;
const DRAWER_COLLAPSED = 72;

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/admin' },
  { label: 'Articles',      icon: FileText,        path: '/admin/articles' },
  { label: 'Vidéos',        icon: Video,           path: '/admin/videos' },
  { label: 'Messages',      icon: MessageSquare,   path: '/admin/messages' },
  { label: 'Notifications', icon: Bell,            path: '/admin/notifications' },
  { label: 'Paramètres',    icon: Settings,        path: '/admin/settings' },
];

const SUPERADMIN_NAV_ITEMS = [
  { label: 'Community', icon: Users, path: '/admin/community' },
];

export function AdminLayout() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { isSuperAdmin } = useRole();
  const profile = usePortfolioStore((s) => s.profile);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      usePortfolioStore.getState().resetProfile();
      navigate(`/${DEFAULT_TENANT}`, { replace: true });
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width, flexShrink: 0, transition: 'width 0.2s',
          '& .MuiDrawer-paper': {
            width, boxSizing: 'border-box', bgcolor: 'background.paper',
            borderRight: '1px solid', borderColor: 'divider',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', transition: 'width 0.2s',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: collapsed ? 1.5 : 2.5, py: 2.5 }}>
          {!collapsed && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, mb: 0.25 }}>Admin</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', lineHeight: 1.2 }}>{profile.name || 'Tableau de bord'}</Typography>
            </Box>
          )}
          <Box
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '8px', color: 'text.secondary',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              flexShrink: 0,
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Box>
        </Box>

        <Divider sx={{ mx: collapsed ? 1 : 2, mb: collapsed ? 1.5 : 1.5 }} />

        {/* Nav */}
        <List sx={{ flex: 1, px: collapsed ? 0.5 : 1 }}>
          {ADMIN_NAV_ITEMS.map((item) => (
            <ListItemButton key={item.path} onClick={() => navigate(item.path)} selected={isActive(item.path)}
              sx={{ borderRadius: '10px', mb: 0.3, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 44, px: collapsed ? 1 : 1.5,
                '&.Mui-selected': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              }}>
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: isActive(item.path) ? 'primary.main' : 'text.secondary', justifyContent: 'center' }}>
                <item.icon size={20} />
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: isActive(item.path) ? 700 : 500 } } }} />}
            </ListItemButton>
          ))}

          {isSuperAdmin && !collapsed && (
            <>
              <Divider sx={{ mx: 1, my: 1.5 }} />
              <Typography variant="overline" sx={{ px: 2, color: 'text.disabled', fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1 }}>SuperAdmin</Typography>
              {SUPERADMIN_NAV_ITEMS.map((item) => (
                <ListItemButton key={item.path} onClick={() => navigate(item.path)} selected={isActive(item.path)}
                  sx={{ borderRadius: '10px', mb: 0.3, minHeight: 44, px: 1.5,
                    '&.Mui-selected': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                  }}>
                  <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? 'primary.main' : 'text.secondary' }}>
                    <item.icon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: isActive(item.path) ? 700 : 500 } } }} />
                </ListItemButton>
              ))}
            </>
          )}
        </List>

        {/* Logout */}
        <Divider sx={{ mx: collapsed ? 1 : 2, mb: 1 }} />
        <ListItemButton onClick={() => setLogoutOpen(true)}
          sx={{ borderRadius: '10px', mx: collapsed ? 0.5 : 1, mb: 1.5, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 44, px: collapsed ? 1 : 1.5 }}>
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: 'center', color: 'text.secondary' }}>
            <LogOut size={20} />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Déconnexion" slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: 500 } } }} />}
        </ListItemButton>
      </Drawer>

      {/* Content */}
      <Box component="main" sx={{ flex: 1, p: { xs: 3, md: 5 }, overflow: 'auto', maxWidth: '100%' }}>
        <Outlet />
      </Box>

      {/* Logout confirmation */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Déconnexion</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>Êtes-vous sûr de vouloir vous déconnecter ?</Typography></DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setLogoutOpen(false)} disabled={loggingOut} sx={{ borderRadius: '30px', textTransform: 'none', fontWeight: 600 }}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleLogout} disabled={loggingOut} sx={{ borderRadius: '30px', textTransform: 'none', fontWeight: 600 }}>
            {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
