import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, Divider } from '@mui/material';
import { Save, Github, Instagram, MessageSquare, User, Tag, MapPin, Image, ShieldAlert, Heart, Users, UserCheck } from 'lucide-react';
import { usePortfolioStore } from '../../store/portfolio';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';

const formatUsername = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/-+/g, '-')             // replace multiple hyphens with one
    .replace(/^-+|-+$/g, '');        // trim hyphens
};

export function AdminSettings() {
  const profile = usePortfolioStore((s) => s.profile);
  const updateProfile = usePortfolioStore((s) => s.updateProfile);
  const { saveToSupabase } = useProfile();
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    name: '',
    title: '',
    location: '',
    avatarUrl: '',
    github: '',
    discord: '',
    instagram: '',
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        title: profile.title || '',
        location: profile.location || '',
        avatarUrl: profile.avatarUrl || '',
        github: profile.socials?.github || '',
        discord: profile.socials?.discord || '',
        instagram: profile.socials?.instagram || '',
      });
      setUsernameInput(profile.username || '');
    }
  }, [profile]);

  // Real-time username uniqueness check with 400ms debounce
  useEffect(() => {
    if (!usernameInput) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    const formatted = formatUsername(usernameInput);
    if (!formatted) {
      setUsernameStatus('invalid');
      setUsernameMessage("Nom d'utilisateur vide ou invalide");
      return;
    }

    // Check if it matches user's current username
    if (profile.username && formatted === profile.username.toLowerCase()) {
      setUsernameStatus('available');
      setUsernameMessage("Votre nom d'utilisateur actuel");
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Vérification de la disponibilité...');

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', formatted)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setUsernameStatus('taken');
          setUsernameMessage("Ce nom d'utilisateur est déjà pris ❌");
        } else {
          setUsernameStatus('available');
          setUsernameMessage("Ce nom d'utilisateur est disponible ! ✔️");
        }
      } catch (err) {
        console.error(err);
        setUsernameStatus('idle');
        setUsernameMessage('');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [usernameInput, profile.username]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = formatUsername(usernameInput);

    if (!finalUsername) {
      alert("Le nom d'utilisateur est invalide.");
      return;
    }
    if (usernameStatus === 'taken') {
      alert("Le nom d'utilisateur choisi est déjà pris.");
      return;
    }

    const updated = {
      ...profile,
      name: form.name,
      title: form.title,
      location: form.location,
      avatarUrl: form.avatarUrl,
      username: finalUsername,
      socials: {
        github: form.github,
        discord: form.discord,
        instagram: form.instagram,
      },
    };
    updateProfile(updated);
    await saveToSupabase(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUsernameChange = (val: string) => {
    // Keep it lowercase and replace spaces/specials dynamically on change
    const transformed = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    setUsernameInput(transformed);
  };

  return (
    <Box component="form" onSubmit={handleSave}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Paramètres</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>
        Gérez vos informations de profil, vos réseaux sociaux et vos statistiques de blog
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid', borderColor: 'divider', mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Informations de Profil</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Nom d'utilisateur (URL de profil)"
                value={usernameInput}
                onChange={e => handleUsernameChange(e.target.value)}
                required
                fullWidth
                helperText={usernameMessage}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>
                        <UserCheck size={18} />
                      </Box>
                    ),
                  },
                  formHelperText: {
                    sx: {
                      fontWeight: 600,
                      color:
                        usernameStatus === 'available'
                          ? 'success.main'
                          : usernameStatus === 'taken' || usernameStatus === 'invalid'
                          ? 'error.main'
                          : 'text.secondary',
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
              <TextField
                label="Nom complet"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>
                        <User size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Titre / Profession"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>
                        <Tag size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Localisation"
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                required
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>
                        <MapPin size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="URL de l'avatar"
                value={form.avatarUrl}
                onChange={e => setForm(p => ({ ...p, avatarUrl: e.target.value }))}
                required
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>
                        <Image size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Réseaux Sociaux</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="GitHub URL"
                value={form.github}
                onChange={e => setForm(p => ({ ...p, github: e.target.value }))}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>
                        <Github size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Discord Link / ID"
                value={form.discord}
                onChange={e => setForm(p => ({ ...p, discord: e.target.value }))}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>
                        <MessageSquare size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Instagram URL"
                value={form.instagram}
                onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.secondary', mr: 1.5, display: 'flex' }}>
                        <Instagram size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Statistiques & Badge (Lecture seule)</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3, fontWeight: 500 }}>
              Ces statistiques ne peuvent pas être modifiées directement par les tenants.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Abonnés"
                value={profile.followers || '0'}
                disabled
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.disabled', mr: 1.5, display: 'flex' }}>
                        <Users size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Abonnements"
                value={profile.following || '0'}
                disabled
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.disabled', mr: 1.5, display: 'flex' }}>
                        <Users size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="J'aime"
                value={profile.likes || '0'}
                disabled
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ color: 'text.disabled', mr: 1.5, display: 'flex' }}>
                        <Heart size={18} />
                      </Box>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ color: profile.isVerified ? 'primary.main' : 'text.disabled', display: 'flex' }}>
                  <ShieldAlert size={20} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Badge vérifié : {profile.isVerified ? 'Activé ✓' : 'Non activé'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Le badge vérifié est attribué uniquement par les administrateurs système.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<Save size={18} />}
          sx={{ borderRadius: '30px', px: 4 }}
        >
          {saved ? 'Enregistré ✓' : 'Enregistrer'}
        </Button>
      </Box>
    </Box>
  );
}
