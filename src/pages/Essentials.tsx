import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { SEOHead } from '../components/SEOHead';

export function Essentials() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead title="Conditions d'utilisation" description="Conditions d'utilisation du blog — droits, obligations et responsabilités des utilisateurs." />
      <Container maxWidth="md" sx={{ py: 6, minHeight: '100vh' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 4, color: 'text.secondary', fontWeight: 700 }}>
          Retour
        </Button>

        <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>Conditions d'utilisation</Typography>

        <Box sx={{ '& p': { mb: 2, lineHeight: 1.7 }, '& h5': { fontWeight: 700, mt: 4, mb: 1 } }}>
          <Typography variant="body1" color="text.secondary">
            Dernière mise à jour : juillet 2026.
          </Typography>

          <Typography variant="h5">1. Objet</Typography>
          <Typography variant="body1" color="text.secondary">
            Les présentes conditions régissent l'utilisation du site et de ses services, notamment l'inscription à la newsletter et l'accès aux contenus publiés.
          </Typography>

          <Typography variant="h5">2. Contenus</Typography>
          <Typography variant="body1" color="text.secondary">
            Les articles, tutoriels et ressources publiés sont fournis à titre informatif et pédagogique. Leur contenu peut évoluer sans préavis. La reproduction ou redistribution sans autorisation est interdite.
          </Typography>

          <Typography variant="h5">3. Responsabilités</Typography>
          <Typography variant="body1" color="text.secondary">
            Le site s'efforce de fournir des informations exactes et à jour, mais ne peut garantir l'exhaustivité ou l'exactitude des contenus. L'utilisation des informations et ressources se fait sous votre propre responsabilité.
          </Typography>

          <Typography variant="h5">4. Désabonnement</Typography>
          <Typography variant="body1" color="text.secondary">
            Vous pouvez vous désabonner de la newsletter à tout moment via le lien présent dans chaque e-mail. Votre adresse sera alors supprimée de nos listes sous 48 heures.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
