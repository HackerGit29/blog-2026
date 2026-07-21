import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { ShaderAnimation } from '../../components/ui/ShaderAnimation';
import { TurnstileWidget } from '../../components/TurnstileWidget';

const RATE_LIMIT_KEY = 'login_attempts';
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function getAttempts(): { count: number; since: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { count: 0, since: Date.now() };
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.since > COOLDOWN_MS) return { count: 0, since: Date.now() };
    return parsed;
  } catch { return { count: 0, since: Date.now() }; }
}

function recordFailure() {
  const attempts = getAttempts();
  const updated = { count: attempts.count + 1, since: attempts.count === 0 ? Date.now() : attempts.since };
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(updated));
  return updated;
}

function isRateLimited(): boolean {
  return getAttempts().count >= MAX_ATTEMPTS;
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: '#0a0a0a',
    '& fieldset': { borderColor: '#1a1a1a' },
    '&:hover fieldset': { borderColor: '#333' },
    '&.Mui-focused fieldset': { borderColor: '#FFE213' },
    '& input': { color: '#f0f0f0' },
    '& input::placeholder': { color: '#555', opacity: 1 },
    '& input::-webkit-input-placeholder': { color: '#555', opacity: 1 },
    '& input::-moz-placeholder': { color: '#555', opacity: 1 },

    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px #0a0a0a inset',
      WebkitTextFillColor: '#f0f0f0',
      caretColor: '#f0f0f0',
      borderRadius: '10px',
    },

    '& input:-webkit-autofill:hover': {
      WebkitBoxShadow: '0 0 0 1000px #0a0a0a inset',
    },

    '& input:-webkit-autofill:focus': {
      WebkitBoxShadow: '0 0 0 1000px #0a0a0a inset',
    },
  },
  '& .MuiInputLabel-root': { color: '#666' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#FFE213' },
  '& .MuiInputAdornment-root .lucide': { color: '#666' },
  '& .MuiInputBase-input::selection': {
    background: '#FFE213',
    color: '#000',
  },
  '& .MuiInputBase-input': {
    caretColor: '#FFE213',
  },
  '& .MuiInputBase-input::placeholder': { color: '#555 !important', opacity: 1 },
  '& .MuiInputBase-input::-webkit-input-placeholder': { color: '#555 !important', opacity: 1 },
  '& .MuiInputBase-input::-moz-placeholder': { color: '#555 !important', opacity: 1 },
};

export function Login() {
  const { signInWithEmail, signUpWithEmail, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const onTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setPendingSubmit(true);
  }, []);

  const onTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  const autoWelcome = useCallback(async (userId: string) => {
    try {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('title', 'Bienvenue sur la communauté !')
        .maybeSingle();
      if (existing) return;
      await supabase.from('notifications').insert([
        {
          user_id: userId,
          kind: 'system',
          title: 'Bienvenue sur la communauté !',
          body: 'Votre espace personnel est prêt. Explorez les articles, tutoriels vidéo et ressources. Connectez-vous avec la communauté et partagez votre parcours.',
        },
        {
          user_id: userId,
          kind: 'system',
          title: 'Personnalisez votre profil',
          body: 'Ajoutez votre photo, votre bio et vos réseaux sociaux pour rendre votre profil unique et faciliter les échanges avec les autres membres.',
        },
      ]);
    } catch (_) {}
  }, []);

  if (authLoading) return null;
  if (user) { navigate('/onboarding', { replace: true }); return null; }

  const doLogin = async () => {
    setSubmitting(true);
    setError('');
    try {
      if (isRegister) {
        await signUpWithEmail(email, password);
        setError('Compte créé ! Vérifiez votre email.');
        setIsRegister(false);
      } else {
        const { user } = await signInWithEmail(email, password);

        autoWelcome(user.id);

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user.id)
          .maybeSingle();
        navigate(profile?.username ? `/${profile.username}` : '/onboarding', { replace: true });
      }
      setShowTurnstile(false);
      setTurnstileToken(null);
    } catch (err: any) {
      recordFailure();
      setError(err.message || 'Erreur de connexion');
      setShowTurnstile(false);
      setTurnstileToken(null);
    } finally {
      setSubmitting(false);
      setPendingSubmit(false);
    }
  };

  const doLoginRef = useRef(doLogin);
  doLoginRef.current = doLogin;

  useEffect(() => {
    if (pendingSubmit && turnstileToken) {
      doLoginRef.current();
    }
  }, [pendingSubmit, turnstileToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited()) {
      setError('Trop de tentatives. Réessayez dans 24h.');
      return;
    }
    if (!turnstileToken) {
      setShowTurnstile(true);
      return;
    }
    doLoginRef.current();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden', bgcolor: '#000' }}>
      {/* Shader — 70% */}
      <Box
        sx={{
          width: '50%',
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          height: '100%',
          overflow: 'hidden',
          bgcolor: '#000',
        }}
      >
        <ShaderAnimation />
      </Box>

      {/* Form — 30% */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          bgcolor: '#000',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFE213', mb: 0.5, letterSpacing: '-0.5px' }}>
            {isRegister ? '' : ''}
          </Typography>
          <Typography sx={{ color: '#666', fontSize: '0.875rem', mb: 4 }}>
            {isRegister ? '' : ''}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              fullWidth
              placeholder="name@domain.com"
              slotProps={{
                input: { startAdornment: <InputAdornment position="start"><Mail size={16} color="#666" /></InputAdornment> },
                inputLabel: { shrink: true },
              }}
              sx={inputSx}
            />

            <TextField
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              fullWidth
              placeholder="••••••••"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Lock size={16} color="#666" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#666' }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
                inputLabel: { shrink: true },
              }}
              sx={inputSx}
            />

            {error && (
              <Alert
                severity={error.includes('Vérifiez') ? 'success' : 'error'}
                sx={{ borderRadius: '10px', bgcolor: '#0a0a0a', color: '#ccc', border: '1px solid #1a1a1a', '& .MuiAlert-icon': { color: error.includes('Vérifiez') ? '#4caf50' : '#f44336' } }}
              >
                {error}
              </Alert>
            )}

            <TurnstileWidget
              siteKey={import.meta.env.VITE_TURNSTILE_SITEKEY}
              onVerify={onTurnstileVerify}
              onExpire={onTurnstileExpire}
              onError={() => setTurnstileToken(null)}
              theme="dark"
              enabled={showTurnstile}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting || !email || !password}
              endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: '30px',
                bgcolor: '#FFE213',
                color: '#000',
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#e6cc00' },
                '&.Mui-disabled': { bgcolor: '#1a1a1a', color: '#444' },
              }}
            >
              {submitting ? 'Connexion...' : isRegister ? 'Créer le compte' : 'Se connecter'}
            </Button>

            <Button
              variant="text"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#666', fontSize: '0.8rem', '&:hover': { color: '#FFE213' } }}
            >
              {isRegister ? 'Déjà un compte ? Connectez-vous' : 'Pas encore de compte ? Créez-en un'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
