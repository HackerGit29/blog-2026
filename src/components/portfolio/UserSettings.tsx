import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../../store/portfolio';
import { useProfile } from '../../hooks/useProfile';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../hooks/useAuth';

interface UserSettingsProps {
  onClose: () => void;
}

export function UserSettings({ onClose }: UserSettingsProps) {
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
      followers: data.get('followers') as string,
      following: data.get('following') as string,
      likes: data.get('likes') as string,
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

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.6)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Box
        component="form"
        onSubmit={handleSave}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '24px',
          p: 4,
          width: '90%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar src={profile.avatarUrl} sx={{ width: 56, height: 56 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Paramètres du profil</Typography>
            <Typography variant="body2" color="text.secondary">{profile.name}</Typography>
          </Box>
        </Box>

        <TextField name="name" label="Nom" defaultValue={profile.name} fullWidth sx={{ mb: 2 }} />
        <TextField name="title" label="Titre" defaultValue={profile.title} fullWidth sx={{ mb: 2 }} />
        <TextField name="location" label="Localisation" defaultValue={profile.location} fullWidth sx={{ mb: 2 }} />
        <TextField name="avatarUrl" label="URL de l'avatar" defaultValue={profile.avatarUrl} fullWidth sx={{ mb: 2 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>Réseaux sociaux</Typography>
        <TextField name="discord" label="Discord" defaultValue={profile.socials.discord} fullWidth sx={{ mb: 2 }} />
        <TextField name="github" label="GitHub" defaultValue={profile.socials.github} fullWidth sx={{ mb: 2 }} />
        <TextField name="instagram" label="Instagram" defaultValue={profile.socials.instagram} fullWidth sx={{ mb: 2 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>Statistiques</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField name="followers" label="Abonnés" defaultValue={profile.followers} sx={{ flex: 1 }} />
          <TextField name="following" label="Abonnements" defaultValue={profile.following} sx={{ flex: 1 }} />
          <TextField name="likes" label="J'aime" defaultValue={profile.likes} sx={{ flex: 1 }} />
        </Box>

        {isAdmin && (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<Shield size={18} />}
            onClick={() => { onClose(); navigate('/admin'); }}
            sx={{ mt: 3, py: 1.2, fontWeight: 700 }}
          >
            Accéder au panneau d'administration
          </Button>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="outlined" color="error" startIcon={<LogOut size={16} />} onClick={handleSignOut}>
            Déconnexion
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">Enregistrer</Button>
        </Box>
      </Box>
    </Box>
  );
}
