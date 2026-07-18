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
  CircularProgress,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { LogOut, Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore, DEFAULT_TENANT } from '../../store/portfolio';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import { optimizedAvatar } from '../../lib/optimizedUrl';

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
  const { magneticEnabled, cursorEnabled, setMagneticEnabled, setCursorEnabled } = usePortfolioStore();
  const { saveToSupabase, uploadAvatar, uploading } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAvatar(file);
    setAvatarPreview(url);
    updateProfile({ avatarUrl: url });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const updated = {
      name: data.get('name') as string,
      title: data.get('title') as string,
      location: data.get('location') as string,
      description: data.get('description') as string,
      followers: profile.followers,
      following: profile.following,
      likes: profile.likes,
      avatarUrl: avatarPreview,
      socials: {
        discord: data.get('discord') as string,
        github: data.get('github') as string,
        instagram: data.get('instagram') as string,
        linkedin: data.get('linkedin') as string,
        x: data.get('x') as string,
        email: data.get('email') as string,
        youtube: data.get('youtube') as string,
      },
    };
    updateProfile(updated);
    await saveToSupabase(updated);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate(`/${DEFAULT_TENANT}`);
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
          <Box sx={{ position: 'relative' }}>
            <Avatar src={optimizedAvatar(avatarPreview, 128)} sx={{ width: 64, height: 64 }} />
            <IconButton
              size="small"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                bgcolor: 'primary.main',
                color: '#fff',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 28,
                height: 28,
              }}
            >
              {uploading ? <CircularProgress size={14} color="inherit" /> : <Camera size={14} />}
            </IconButton>
          </Box>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
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
        </Box>

        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 1 }}>
          Réseaux
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mt: 0.5, mb: 2 }}>
          <TextField name="discord" label="Discord" defaultValue={profile.socials.discord} size="small" />
          <TextField name="github" label="GitHub" defaultValue={profile.socials.github} size="small" />
          <TextField name="instagram" label="Instagram" defaultValue={profile.socials.instagram} size="small" />
          <TextField name="linkedin" label="LinkedIn" defaultValue={profile.socials.linkedin} size="small" />
          <TextField name="x" label="X / Twitter" defaultValue={profile.socials.x} size="small" />
          <TextField name="email" label="Email" defaultValue={profile.socials.email} size="small" />
          <TextField name="youtube" label="YouTube" defaultValue={profile.socials.youtube} size="small" />
        </Box>

        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 1 }}>
           À propos
         </Typography>
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0.5, mb: 2 }}>
           <TextField name="description" label="Description" defaultValue={profile.description} multiline rows={3} size="small" />
           {profile.memberSince && (
             <TextField label="Membre depuis" value={profile.memberSince ? new Date(profile.memberSince).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} disabled size="small" />
           )}
         </Box>

         <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 1 }}>
           Expérience
         </Typography>
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5, mb: 2 }}>
           <FormControlLabel
             control={<Switch checked={magneticEnabled} onChange={(e) => setMagneticEnabled(e.target.checked)} />}
             label={<Typography sx={{ color: 'text.primary', fontSize: '0.875rem' }}>Effet Magnétique</Typography>}
           />
           <FormControlLabel
             control={<Switch checked={cursorEnabled} onChange={(e) => setCursorEnabled(e.target.checked)} />}
             label={<Typography sx={{ color: 'text.primary', fontSize: '0.875rem' }}>Curseur Animé</Typography>}
           />
         </Box>
 
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
