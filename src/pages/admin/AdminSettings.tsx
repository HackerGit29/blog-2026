import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, useTheme } from '@mui/material';
import { Save, Github, Linkedin, Twitter, Globe } from 'lucide-react';

interface SocialLink {
  label: string; key: string; icon: any; value: string; placeholder: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', key: 'github', icon: Github, value: 'https://github.com/HackerGit29', placeholder: 'https://github.com/votre-profil' },
  { label: 'LinkedIn', key: 'linkedin', icon: Linkedin, value: '', placeholder: 'https://linkedin.com/in/votre-profil' },
  { label: 'Twitter / X', key: 'twitter', icon: Twitter, value: '', placeholder: 'https://x.com/votre-compte' },
  { label: 'Site web', key: 'website', icon: Globe, value: 'https://benji-aka-dev.site', placeholder: 'https://votre-site.com' },
];

export function AdminSettings() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [links, setLinks] = useState(SOCIAL_LINKS);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('blog_social_links', JSON.stringify(links));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Paramètres</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>Liens sociaux et configuration du blog</Typography>

      <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid', borderColor: 'divider', maxWidth: 640 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Liens sociaux</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {links.map((link, i) => (
            <Box key={link.key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                <link.icon size={20} />
              </Box>
              <TextField
                label={link.label}
                value={link.value}
                onChange={e => {
                  const updated = [...links];
                  updated[i] = { ...updated[i], value: e.target.value };
                  setLinks(updated);
                }}
                placeholder={link.placeholder}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>
          ))}
        </Box>
        <Button
          variant="contained"
          startIcon={<Save size={18} />}
          onClick={handleSave}
          sx={{ mt: 3, borderRadius: '30px' }}
        >
          {saved ? 'Enregistré ✓' : 'Enregistrer'}
        </Button>
      </Paper>

      <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid', borderColor: 'divider', maxWidth: 640, mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Community Manager</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 2 }}>
        Gérez votre présence sociale et le calendrier éditorial.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {['Twitter/X', 'LinkedIn', 'GitHub'].map(platform => (
            <Button key={platform} variant="outlined" size="small" sx={{ borderRadius: '20px', textTransform: 'none' }}>
              Publier sur {platform}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
