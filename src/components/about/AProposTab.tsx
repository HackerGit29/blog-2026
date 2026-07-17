import React from 'react';
import { Box, Typography, Link, Skeleton } from '@mui/material';
import { Calendar } from 'lucide-react';
import { usePublicProfile } from '../../hooks/usePublicProfile';

const SVG_ICONS: Record<string, string> = {
  discord: '/assets/discord.svg',
  github: '/assets/github.svg',
  instagram: '/assets/instagram.svg',
  linkedin: '/assets/linkedin.svg',
  x: '/assets/x.svg',
  email: '/assets/gmail.svg',
  youtube: '/assets/youtube.svg',
};

const LINK_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  x: 'X / Twitter',
  discord: 'Discord',
  email: 'Email',
  youtube: 'YouTube',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export function AProposTab({ username }: { username?: string }) {
  const { data: profile, isLoading } = usePublicProfile(username);

  if (isLoading) {
    return (
      <Box sx={{ py: 2 }}>
        <Skeleton width="30%" height={32} sx={{ mb: 2 }} />
        <Skeleton width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton width="80%" height={20} sx={{ mb: 1 }} />
        <Skeleton width="60%" height={20} sx={{ mb: 4 }} />
        <Skeleton width="20%" height={32} sx={{ mb: 2 }} />
        <Skeleton width="50%" height={20} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="body1" color="text.secondary">Aucune information disponible.</Typography>
      </Box>
    );
  }

  const links = Object.entries(LINK_LABELS)
    .map(([key, label]) => {
      const socials = profile.socials as Record<string, string | undefined>;
      const url = socials[key];
      if (!url) return null;
      return { key, label, url };
    })
    .filter(Boolean) as { key: string; label: string; url: string }[];

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>Description</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 5, whiteSpace: 'pre-wrap' }}>
        {profile.description || profile.name + " n'a pas encore ajout\u00E9 de description."}
      </Typography>

      {links.length > 0 && (
        <>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>Liens</Typography>
          <Box sx={{ mb: 5 }}>
            {links.map((link) => (
              <Box key={link.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.8 }}>
                <Box sx={{ width: 18, height: 18, display: 'flex', flexShrink: 0, color: 'text.secondary' }}>
                  <Box component="img" src={SVG_ICONS[link.key]} alt={link.label} sx={{ width: '100%', height: '100%', filter: 'brightness(0) saturate(100%) invert(40%)' }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 80, fontWeight: 500 }}>{link.label}</Typography>
                <Link href={link.url} target="_blank" rel="noopener noreferrer"
                  sx={{ color: '#4FC3F7', textDecoration: 'none', fontSize: '0.875rem', wordBreak: 'break-all', '&:hover': { textDecoration: 'underline' } }}>
                  {link.url.replace(/^https?:\/\//, '')}
                </Link>
              </Box>
            ))}
          </Box>
        </>
      )}

      <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>Plus d'infos</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {profile.memberSince && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}><Calendar size={16} /></Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 80, fontWeight: 500 }}>Membre depuis</Typography>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>{formatDate(profile.memberSince)}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}