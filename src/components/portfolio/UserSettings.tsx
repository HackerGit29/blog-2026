import {
  Dialog,
  AppBar,
  Toolbar,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../store/portfolio';
import { useProfile } from '../../hooks/useProfile';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../hooks/useAuth';

interface UserSettingsProps {
  open: boolean;
  onClose: () => void;
}

const SlideUp = function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
) {
  return <Slide direction="up" {...props} />;
};

export function UserSettings({ open, onClose }: UserSettingsProps) {
  const profile = usePortfolioStore((s) => s.profile);
  const updateProfile = usePortfolioStore((s) => s.updateProfile);
  const { saveToSupabase } = useProfile();
  const { isAdmin } = useRole();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const updated = {
      name: data.get('name') as string,
      title: data.get('title') as string,
      location: data.get('location') as string,
      followers: profile.followers,
      following: profile.following,
      likes: profile.likes,
      avatarUrl: data.get('avatarUrl') as string,
      socials: {
        discord: data.get('discord') as string,
        github: data.get('github') as string,
        instagram: data.get('instagram') as string,
      },
    };
    updateProfile(updated);
    await saveToSupabase(updated);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  const handleAdmin = () => {
    onClose();
    navigate('/admin');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slots={{ transition: SlideUp }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'background.default',
            backgroundImage: 'none',
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { sm: '85vh' },
            borderRadius: 0,
            m: { xs: 0, sm: 2 },
          },
        },
      }}
    >
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{
          bgcolor: 'background.default',
          backgroundImage: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
            Paramètres du profil
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="form" onSubmit={handleSave} sx={{ p: 2.5, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Avatar src={profile.avatarUrl} sx={{ width: 48, height: 48 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
              {profile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {profile.title}
            </Typography>
          </Box>
        </Box>

        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 1 }}>
          Identité
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 0.5, mb: 2 }}>
          <TextField name="name" label="Nom" defaultValue={profile.name} size="small" />
          <TextField name="title" label="Titre" defaultValue={profile.title} size="small" />
          <TextField name="location" label="Localisation" defaultValue={profile.location} size="small" />
          <TextField name="avatarUrl" label="URL avatar" defaultValue={profile.avatarUrl} size="small" />
        </Box>

        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 1 }}>
          Réseaux
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mt: 0.5, mb: 2 }}>
          <TextField name="discord" label="Discord" defaultValue={profile.socials.discord} size="small" />
          <TextField name="github" label="GitHub" defaultValue={profile.socials.github} size="small" />
          <TextField name="instagram" label="Instagram" defaultValue={profile.socials.instagram} size="small" />
        </Box>

        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 1 }}>
          Statistiques
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mt: 0.5, mb: 2 }}>
          <TextField label="Abonnés" value={profile.followers} disabled size="small" />
          <TextField label="Abonnements" value={profile.following} disabled size="small" />
          <TextField label="J'aime" value={profile.likes} disabled size="small" />
        </Box>

        {isAdmin && (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<Shield size={18} />}
            onClick={handleAdmin}
            sx={{ mt: 1, py: 1, fontWeight: 700 }}
          >
            Accéder au panneau d'administration
          </Button>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" sx={{ gap: 1 }}>
          <Button variant="outlined" color="error" size="small" startIcon={<LogOut size={16} />} onClick={handleSignOut}>
            Déconnexion
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" size="small" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" size="small">
            Enregistrer
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
