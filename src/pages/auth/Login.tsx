import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { signInWithEmail, signUpWithEmail, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) return null;
  if (user) { navigate('/', { replace: true }); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await signUpWithEmail(email, password);
        setError('Compte créé ! Vérifiez votre email pour confirmer.');
        setIsRegister(false);
      } else {
        await signInWithEmail(email, password);
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 5 },
          maxWidth: 440,
          width: '100%',
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {isRegister ? 'Créer un compte' : 'Administration'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>
          {isRegister ? 'Créez votre compte pour gérer le blog' : 'Connectez-vous pour gérer le blog'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment>,
              }
            }}
          />
          <TextField
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Lock size={18} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          {error && <Alert severity={error.includes('Vérifiez') ? 'success' : 'error'} sx={{ borderRadius: '12px' }}>{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting || !email || !password}
            endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ArrowRight size={18} />}
            sx={{ py: 1.5, borderRadius: '30px' }}
          >
            {submitting ? 'Connexion...' : isRegister ? 'Créer le compte' : 'Se connecter'}
          </Button>

          <Button
            variant="text"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isRegister ? 'Déjà un compte ? Connectez-vous' : 'Pas encore de compte ? Créez-en un'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
