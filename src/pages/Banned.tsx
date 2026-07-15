import { Box, Typography, Button } from '@mui/material';
import { ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Banned() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'error.main',
          bgcolor: (t) => `${t.palette.error.main}14`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'error.main',
          mb: 3,
        }}
      >
        <ShieldOff size={36} strokeWidth={1.5} />
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Accès suspendu
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mb: 4 }}>
        Votre compte a été suspendu par un administrateur. Si vous pensez qu'il s'agit d'une erreur, contactez le support.
      </Typography>

      <Button variant="outlined" onClick={handleSignOut}>
        Se déconnecter
      </Button>
    </Box>
  );
}
