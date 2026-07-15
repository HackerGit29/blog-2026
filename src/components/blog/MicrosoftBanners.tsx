import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { ExternalLink } from 'lucide-react';

interface BannerProps {
  title: string;
  description: string;
  url: string;
  cta: string;
}

function Banner({ title, description, url, cta }: BannerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener"
      sx={{
        display: 'block',
        textDecoration: 'none',
        p: 3.5,
        borderRadius: '20px',
        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F0EDE2',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#1A1A1A',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          endIcon={<ExternalLink size={14} />}
          sx={{ flexShrink: 0, borderRadius: '30px', whiteSpace: 'nowrap' }}
        >
          {cta}
        </Button>
      </Box>
    </Box>
  );
}

export function MicrosoftReactorBanner() {
  return (
    <Banner
      title="Participez aux événements Microsoft Reactor"
      description="Ateliers gratuits, sessions Q&A et hackathons animés par des experts Microsoft et des community leaders."
      url="https://developer.microsoft.com/reactor"
      cta="Découvrir les événements"
    />
  );
}

export function CommunitySkillingBanner() {
  return (
    <Banner
      title="Programme Community Skilling"
      description="Un parcours guidé de l'apprentissage à la certification Microsoft, porté par les Microsoft Learn Student Ambassadors."
      url="https://learn.microsoft.com"
      cta="Commencer sur Microsoft Learn"
    />
  );
}

export function MicrosoftBanners() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 5 }}>
      <MicrosoftReactorBanner />
      <CommunitySkillingBanner />
    </Box>
  );
}
