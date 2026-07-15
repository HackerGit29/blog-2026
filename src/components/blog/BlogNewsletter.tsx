import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, TextField, Paper, CircularProgress, Alert, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail as MailIcon } from 'lucide-react';
import { useNewsletterSubscribe } from '../../hooks/useNewsletterSubscribe';
import { TurnstileWidget } from '../TurnstileWidget';
import { AlertDialog } from '../ui/AlertDialog';

const newsletterSchema = z.object({
  email: z.string().min(1, { message: 'L\'adresse email est requise.' }).email({ message: 'Veuillez entrer une adresse email valide.' }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function BlogNewsletter() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mutate, isPending } = useNewsletterSubscribe();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setErrorMessage(null);
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);

  const onSubmit = (data: NewsletterFormData) => {
    if (!turnstileToken) {
      setErrorMessage('Veuillez valider le captcha.');
      return;
    }
    setSuccessMessage(null);
    setErrorMessage(null);
    mutate({ email: data.email, turnstileToken }, {
      onSuccess: () => {
        setSuccessMessage('Merci ! Votre inscription à la newsletter a été enregistrée avec succès.');
        setDialogOpen(true);
        setTurnstileToken(null);
        reset();
      },
      onError: (err: any) => {
        setErrorMessage(err.message || 'Une erreur est survenue lors de l\'inscription.');
        setTurnstileToken(null);
      },
    });
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 4, md: 5 }, 
        bgcolor: isDark ? 'background.paper' : '#ECE7DB',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#1A1A1A',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <GridWrapper>
        <Box sx={{ flex: 1, minWidth: { md: 350 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2 }}>
            Rejoignez notre communauté
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mt: 1.5 }}>
            Restez à la pointe de l'IA, de Microsoft Learn, Power Platform, du Cloud, de DevOps et du développement web.
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, md: 4 }, 
          flexDirection: { xs: 'column', sm: 'row' }, 
          flex: 1.2,
          justifyContent: 'center'
        }}>
          <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 1.5, fontWeight: 600, fontSize: '0.95rem', color: 'text.primary' } }}>
            <li>Accès exclusif aux articles</li>
            <li>Tutoriels et projets GitHub</li>
          </Box>
          <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 1.5, fontWeight: 600, fontSize: '0.95rem', color: 'text.primary' } }}>
            <li>Plans Microsoft Learn guidés</li>
            <li>Newsletter tech hebdomadaire</li>
          </Box>
        </Box>

        <Box 
          component="form" 
          onSubmit={handleSubmit(onSubmit)}
          sx={{ 
            flex: 1.2, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            width: '100%',
            maxWidth: { xs: '100%', md: '380px' },
            alignSelf: 'center'
          }}
        >
          <Box sx={{ position: 'relative', width: '100%' }}>
            <TextField
              placeholder="votre@email.com"
              fullWidth
              disabled={isPending}
              {...register('email')}
              error={!!errors.email}
              slotProps={{
                input: {
                  startAdornment: (
                    <Box sx={{ color: 'text.secondary', mr: 1, display: 'flex', alignItems: 'center' }}>
                      <MailIcon size={18} />
                    </Box>
                  ),
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '30px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#1A1A1A',
                  bgcolor: isDark ? 'background.default' : '#FFFFFF',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none',
                  },
                }
              }}
            />
            {errors.email && (
              <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5, ml: 2, fontWeight: 600 }}>
                {errors.email.message}
              </Typography>
            )}
          </Box>

          <TurnstileWidget
            siteKey={import.meta.env.VITE_TURNSTILE_SITEKEY}
            onVerify={onTurnstileVerify}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />

          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            disabled={isPending}
            sx={{ 
              py: 1.5,
              fontSize: '0.95rem',
            }}
          >
            {isPending ? <CircularProgress size={24} color="inherit" /> : 'S\'inscrire gratuitement'}
          </Button>

          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: '12px', mt: 1, fontWeight: 500 }}>
              {errorMessage}
            </Alert>
          )}
        </Box>
      </GridWrapper>

      <AlertDialog
        open={dialogOpen}
        onConfirm={() => setDialogOpen(false)}
        onCancel={() => setDialogOpen(false)}
        title="Inscription confirmée !"
        description={successMessage ?? ''}
        confirmText="Super"
        confirmColor="success"
      />
    </Paper>
  );
}

// Simple flex container wrapper for responsive layout
function GridWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: { xs: 'stretch', md: 'center' },
      justifyContent: 'space-between',
      gap: 4,
      width: '100%'
    }}>
      {children}
    </Box>
  );
}
