import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { FileText, Users, Eye, Search } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Paper elevation={0} sx={{
      p: 3.5, borderRadius: '20px',
      border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.03)', color }}>
          <Icon size={24} />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800 }}>{value}</Typography>
    </Paper>
  );
}

export function AdminDashboard() {
  const { data: articles } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await supabase.from('admin_articles').select('id, status, media_type');
      return data as any[] || [];
    },
  });

  const totalArticles = articles?.length || 0;
  const published = articles?.filter(a => a.status === 'published').length || 0;
  const drafts = articles?.filter(a => a.status === 'draft').length || 0;
  const videos = articles?.filter(a => a.media_type === 'video').length || 0;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Dashboard</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>Vue d'ensemble de votre blog</Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={FileText} label="Total articles" value={totalArticles} color="#FFE213" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={Eye} label="Publiés" value={published} color="#22C55E" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={Search} label="Brouillons" value={drafts} color="#F59E0B" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={Users} label="Vidéos" value={videos} color="#6366F1" />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>SEO & Social Media</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SEOField label="Meta description du blog" value="Blog sur l'IA, Microsoft Learn, Power Platform, Cloud, DevOps" />
          <SEOField label="URL canonique" value="https://benji-aka-dev.site" />
          <SEOField label="Liens sociaux" value="GitHub, LinkedIn, Twitter/X" />
        </Box>
      </Paper>
    </Box>
  );
}

function SEOField({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2, borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}
