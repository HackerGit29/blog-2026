import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { SEOHead } from '../components/SEOHead';

export function Privacy() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead title="Politique de confidentialité" description="Politique de confidentialité du blog — collecte, utilisation et protection de vos données personnelles." />
      <Container maxWidth="md" sx={{ py: 6, minHeight: '100vh' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 4, color: 'text.secondary', fontWeight: 700 }}>
          Retour
        </Button>

        <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>Politique de confidentialité</Typography>

        <Box sx={{ '& p': { mb: 2, lineHeight: 1.7 }, '& h5': { fontWeight: 700, mt: 4, mb: 1 } }}>
          <Typography variant="body1" color="text.secondary">
            Dernière mise à jour : juillet 2026.
          </Typography>

          <Typography variant="h5">1. Collecte des données</Typography>
          <Typography variant="body1" color="text.secondary">
            Nous collectons uniquement l'adresse e-mail que vous nous fournissez lors de l'inscription à la newsletter. Aucune autre donnée personnelle n'est collectée sans votre consentement explicite.
          </Typography>

          <Typography variant="h5">2. Utilisation des données</Typography>
          <Typography variant="body1" color="text.secondary">
            Votre adresse e-mail est utilisée exclusivement pour vous envoyer la newsletter tech hebdomadaire. Nous ne partageons, ne vendons ni ne louons vos données à des tiers.
          </Typography>

          <Typography variant="h5">3. Durée de conservation</Typography>
          <Typography variant="body1" color="text.secondary">
            Vos données sont conservées tant que vous restez inscrit à la newsletter. Vous pouvez vous désinscrire à tout moment via le lien de désabonnement présent dans chaque e-mail.
          </Typography>

          <Typography variant="h5">4. Sécurité</Typography>
          <Typography variant="body1" color="text.secondary">
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
          </Typography>

          <Typography variant="h5">5. Vos droits</Typography>
          <Typography variant="body1" color="text.secondary">
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Vous pouvez exercer ces droits en nous contactant via l'adresse e-mail présente sur le profil.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
