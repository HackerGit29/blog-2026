import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { ArrowRight, User, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { usePortfolioStore } from '../store/portfolio';

export function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const resetProfile = usePortfolioStore(s => s.resetProfile);
  const [username, setUsername] = useState(() => user?.email?.split('@')[0]?.replace(/[^a-z0-9_-]/gi, '').toLowerCase() || '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    setSubmitting(true);
    setError('');

    const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!slug || slug.length < 3) {
      setError('Le nom d\'utilisateur doit faire au moins 3 caractères');
      setSubmitting(false);
      return;
    }

    const { error: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', slug)
      .maybeSingle();

    if (existing) { setError('Erreur lors de la vérification du nom'); setSubmitting(false); return; }

    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        username: slug,
        name: name.trim() || slug,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      if (upsertError.message?.includes('duplicate') || upsertError.code === '23505') {
        setError('Ce nom d\'utilisateur est déjà pris');
      } else {
        setError(upsertError.message || 'Erreur lors de la création du profil');
      }
      setSubmitting(false);
      return;
    }

    resetProfile();
    navigate(`/${slug}`, { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000', p: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFE213', mb: 1, letterSpacing: '-0.5px' }}>
          Bienvenue
        </Typography>
        <Typography sx={{ color: '#666', fontSize: '0.875rem', mb: 4 }}>
          Choisis ton nom d'utilisateur pour finaliser ton espace
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Nom d'utilisateur"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            required
            fullWidth
            placeholder="mon-username"
            slotProps={{
              input: { startAdornment: <AtSign size={16} color="#666" /> },
              inputLabel: { shrink: true },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px', bgcolor: '#0a0a0a',
                '& fieldset': { borderColor: '#1a1a1a' },
                '&:hover fieldset': { borderColor: '#333' },
                '&.Mui-focused fieldset': { borderColor: '#FFE213' },
                '& input': { color: '#f0f0f0' },
              },
              '& .MuiInputLabel-root': { color: '#666' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#FFE213' },
            }}
          />

          <TextField
            label="Nom à afficher"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            placeholder="Ton nom public"
            slotProps={{
              input: { startAdornment: <User size={16} color="#666" /> },
              inputLabel: { shrink: true },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px', bgcolor: '#0a0a0a',
                '& fieldset': { borderColor: '#1a1a1a' },
                '&:hover fieldset': { borderColor: '#333' },
                '&.Mui-focused fieldset': { borderColor: '#FFE213' },
                '& input': { color: '#f0f0f0' },
              },
              '& .MuiInputLabel-root': { color: '#666' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#FFE213' },
            }}
          />

          {error && (
            <Alert severity="error" sx={{ borderRadius: '10px', bgcolor: '#0a0a0a', color: '#ccc', border: '1px solid #1a1a1a' }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting || !username}
            endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
            sx={{
              mt: 1, py: 1.5, borderRadius: '30px', bgcolor: '#FFE213', color: '#000',
              fontWeight: 800, fontSize: '0.9rem', textTransform: 'none',
              '&:hover': { bgcolor: '#e6cc00' },
              '&.Mui-disabled': { bgcolor: '#1a1a1a', color: '#444' },
            }}
          >
            {submitting ? 'Création...' : 'Créer mon espace'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
