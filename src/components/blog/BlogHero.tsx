import React from 'react';
import { Box, Typography, Button, Container, Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function BlogHero() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box 
          sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: '24px', 
            overflow: 'hidden',
            boxShadow: theme.palette.mode === 'light' ? 'none' : '0px 8px 24px rgba(0,0,0,0.4)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#1A1A1A',
            mt: 4
          }}
        >
        <Grid container>
          <Grid size={{ xs: 12, md: 6 }} sx={{ p: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2 }}>
              Apprenez l'IA, le Cloud et DevOps avec Microsoft.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
              Un espace conçu pour les étudiants et les développeurs. Suivez des plans Microsoft Learn, explorez des projets GitHub concrets et maîtrisez les technologies de demain.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ minHeight: { xs: 300, md: 500 }, position: 'relative' }}>
            {/* We use a placeholder that matches the aesthetic of the mockup - nature/tech blend */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                clipPath: { xs: 'none', md: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)' }
              }}
            />
          </Grid>
        </Grid>
      </Box>
     </motion.div>
    </Container>
  );
}
