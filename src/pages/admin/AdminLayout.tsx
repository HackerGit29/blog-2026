import React from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Chip, useTheme, Tooltip,
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FileText, BarChart3, Settings, LogOut, LayoutDashboard, Video, Users, ShieldCheck, Lock, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { usePortfolioStore } from '../../store/portfolio';

const DRAWER_WIDTH = 260;

/** Items accessibles à tous les admins */
const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/admin' },
  { label: 'Articles',      icon: FileText,        path: '/admin/articles' },
  { label: 'Vidéos',        icon: Video,           path: '/admin/videos' },
  { label: 'Messages',      icon: MessageSquare,   path: '/admin/messages' },
  { label: 'Notifications', icon: Bell,            path: '/admin/notifications' },
  { label: 'Paramètres',    icon: Settings,        path: '/admin/settings' },
];

/** Items réservés au superadmin */
const SUPERADMIN_NAV_ITEMS = [
  { label: 'Community',   icon: Users,            path: '/admin/community' },
];

export function AdminLayout() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { isSuperAdmin } = useRole();
  const profile = usePortfolioStore((s) => s.profile);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path);

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
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* ── En-tête sidebar ────────────────────────────────────── */}
        <Box sx={{ px: 2, py: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 0.5 }}>
            Admin
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {profile.name}
            </Typography>
            {profile.isVerified && (
              <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
                ✓
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ mx: 2, mb: 2 }} />

        {/* ── Navigation admin ───────────────────────────────────── */}
        <List sx={{ flex: 1, px: 1 }}>
          {/* Routes communes à tous les admins */}
          {ADMIN_NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: '12px',
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'text.secondary' }}>
                <item.icon size={20} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: isActive(item.path) ? 700 : 500 } } }}
              />
            </ListItemButton>
          ))}

          {/* ── Section superadmin ─────────────────────────────── */}
          {(isSuperAdmin || true) && (
            <>
              <Divider sx={{ mx: 1, my: 1.5 }} />
              <Typography
                variant="overline"
                sx={{ px: 2, color: 'text.disabled', fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1 }}
              >
                SuperAdmin
              </Typography>
              {SUPERADMIN_NAV_ITEMS.map((item) =>
                isSuperAdmin ? (
                  <ListItemButton
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      borderRadius: '12px',
                      mb: 0.5,
                      mt: 0.5,
                      '&.Mui-selected': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'text.secondary' }}>
                      <item.icon size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: isActive(item.path) ? 700 : 500 } } }}
                    />
                  </ListItemButton>
                ) : (
                  /* Élément verrouillé pour les admins non vérifiés */
                  <Tooltip
                    key={item.path}
                    title="Accès réservé au SuperAdmin (badge vérifié requis)"
                    placement="right"
                  >
                    <span>
                      <ListItemButton
                        disabled
                        sx={{ borderRadius: '12px', mb: 0.5, mt: 0.5, opacity: 0.4 }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Lock size={18} />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 500 } } }}
                        />
                      </ListItemButton>
                    </span>
                  </Tooltip>
                )
              )}
            </>
          )}
        </List>

        <Divider sx={{ mx: 2, mb: 1 }} />

        {/* ── Déconnexion ────────────────────────────────────────── */}
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: '12px', px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText
            primary="Déconnexion"
            slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 500 } } }}
          />
        </ListItemButton>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: { xs: 3, md: 5 }, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
