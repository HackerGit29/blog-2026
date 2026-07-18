import { Box, Container, Typography, Paper, Button, Chip, Avatar, Divider } from '@mui/material';
import { Edit3, FileText, Video, Settings, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../store/portfolio';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/portfolio/Header';
import { optimizedAvatar } from '../lib/optimizedUrl';

export function MonCompte() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ownProfile = usePortfolioStore((s) => s.ownProfile);

  const links = [
    { label: 'Mes articles', icon: <FileText size={18} />, path: '/admin/articles', color: '#4FC3F7' },
    { label: 'Mes vidéos', icon: <Video size={18} />, path: '/admin/videos', color: '#81C784' },
    { label: 'Paramètres', icon: <Settings size={18} />, path: '/admin/settings', color: '#FFB74D' },
    { label: 'Messages', icon: <Users size={18} />, path: '/admin/messages', color: '#CE93D8' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000' }}>
      <Container maxWidth="md" sx={{ px: { xs: 3, md: 6 } }}>
        <Header />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFE213', mb: 0.5 }}>
            Mon espace
          </Typography>
          <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
            Gérez votre profil, vos articles et vos ressources
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '20px', bgcolor: '#0a0a0a', border: '1px solid', borderColor: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar src={optimizedAvatar(ownProfile?.avatarUrl || '', 120)} alt={ownProfile?.name || user?.email || ''} sx={{ width: 72, height: 72, border: '2px solid', borderColor: 'primary.main' }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{ownProfile?.name || 'Utilisateur'}</Typography>
              <Chip label={ownProfile?.username ? `@${ownProfile.username}` : 'Compte'} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{ownProfile?.title || user?.email}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                <strong>{ownProfile?.followerCount || 0}</strong> abonnés
              </Typography>
            </Box>
          </Box>
          <Button variant="outlined" size="small" startIcon={<Edit3 size={14} />} onClick={() => navigate('/admin/settings')} sx={{ borderRadius: '30px', borderColor: '#333', color: '#ccc', '&:hover': { borderColor: '#FFE213', color: '#FFE213' } }}>
            Modifier
          </Button>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
          {links.map((link) => (
            <Paper
              key={link.path}
              elevation={0}
              onClick={() => navigate(link.path)}
              sx={{
                p: 3, borderRadius: '16px', bgcolor: '#0a0a0a', border: '1px solid', borderColor: '#1a1a1a',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
                transition: 'all 0.2s',
                '&:hover': { borderColor: link.color, bgcolor: '#111' },
              }}
            >
              <Box sx={{ color: link.color }}>{link.icon}</Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{link.label}</Typography>
            </Paper>
          ))}
        </Box>

        {ownProfile?.username && (
          <Button onClick={() => navigate(`/${ownProfile.username}`)} startIcon={<ExternalLink size={16} />} sx={{ color: '#666', '&:hover': { color: '#FFE213' }, textTransform: 'none', fontSize: '0.85rem' }}>
            Voir mon profil public
          </Button>
        )}
      </Container>
    </Box>
  );
}
