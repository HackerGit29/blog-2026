import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Avatar, Chip } from '@mui/material';
import { ShieldCheck, Shield, ShieldOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminUser {
  user_id: string;
  username: string | null;
  name: string | null;
  can_access_admin: boolean;
  role: string | null;
}

type ActionType = 'set_admin' | 'set_superadmin' | 'remove_admin';

export function SuperAdminPanel() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Erreur inconnue');
        return data;
      })
      .then(data => { setUsers(Array.isArray(data) ? data : []); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const toggleRole = async (userId: string, action: ActionType) => {
    if (!session?.access_token || acting) return;
    setActing(userId);
    try {
      const res = await fetch('/api/admin/toggle', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setUsers(prev => prev.map(u => {
        if (u.user_id !== userId) return u;
        if (action === 'set_admin') return { ...u, can_access_admin: true, role: 'admin' };
        if (action === 'set_superadmin') return { ...u, can_access_admin: true, role: 'superadmin' };
        return { ...u, can_access_admin: false, role: 'user' };
      }));
    } catch (e: any) {
      setError(e.message);
    }
    setActing(null);
  };

  const roleChip = (role: string | null) => {
    if (role === 'superadmin') return <Chip label="superadmin" size="small" color="warning" sx={{ fontWeight: 700, fontSize: 11 }} />;
    if (role === 'admin') return <Chip label="admin" size="small" color="primary" sx={{ fontWeight: 700, fontSize: 11 }} />;
    return <Chip label="user" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} />;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Super Admin</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>
        Gérez les accès au panneau d'administration
      </Typography>

      {error && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '16px', bgcolor: 'error.main', color: 'error.contrastText' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{error}</Typography>
        </Paper>
      )}

      <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {users.map(u => {
          const isActing = acting === u.user_id;
          const isSuperAdmin = u.role === 'superadmin';
          const isAdmin = u.role === 'admin' || u.role === 'superadmin';
          return (
            <Box key={u.user_id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, '&+&': { borderTop: '1px solid', borderColor: 'divider' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: isAdmin ? 'primary.main' : 'action.hover', fontSize: 14, fontWeight: 700 }}>
                  {(u.name || u.username || '?')[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{u.name || u.username || '—'}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>@{u.username || '—'}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {roleChip(u.role)}
                {isSuperAdmin ? (
                  <Button size="small" variant="outlined" color="error" onClick={() => toggleRole(u.user_id, 'remove_admin')} disabled={isActing} sx={{ minWidth: 0, px: 1.5 }}>
                    {isActing ? <CircularProgress size={14} /> : <ShieldOff size={16} />}
                  </Button>
                ) : isAdmin ? (
                  <>
                    <Button size="small" variant="outlined" onClick={() => toggleRole(u.user_id, 'set_superadmin')} disabled={isActing} sx={{ minWidth: 0, px: 1.5, color: 'warning.main', borderColor: 'warning.main' }}>
                      {isActing ? <CircularProgress size={14} /> : <Shield size={16} />}
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => toggleRole(u.user_id, 'remove_admin')} disabled={isActing} sx={{ minWidth: 0, px: 1.5 }}>
                      <ShieldOff size={16} />
                    </Button>
                  </>
                ) : (
                  <Button size="small" variant="outlined" onClick={() => toggleRole(u.user_id, 'set_admin')} disabled={isActing} sx={{ minWidth: 0, px: 1.5 }}>
                    {isActing ? <CircularProgress size={14} /> : <ShieldCheck size={16} />}
                  </Button>
                )}
              </Box>
            </Box>
          );
        })}
        {users.length === 0 && !error && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary' }}>Aucun utilisateur trouvé</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
