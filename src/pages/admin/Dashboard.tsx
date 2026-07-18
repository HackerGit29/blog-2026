import { useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { FileText, Users, Eye, Search, Activity, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <Paper elevation={0} sx={{ p: 3.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(0,0,0,0.03)', color, display: 'flex' }}>
          <Icon size={22} />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800 }}>{value}</Typography>
      {sub && <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>{sub}</Typography>}
    </Paper>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data: articles, refetch } = useQuery({
    queryKey: ['admin-stats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('admin_articles')
        .select('id, status, media_type, title, created_at, published_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      return data as any[] || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_articles', filter: `author_id=eq.${user.id}` }, () => {
        refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const totalArticles = articles?.length ?? 0;
  const published = articles?.filter(a => a.status === 'published').length || 0;
  const drafts = articles?.filter(a => a.status === 'draft').length || 0;
  const videos = articles?.filter(a => a.media_type === 'video').length || 0;
  const recentArticles = articles?.slice(0, 5) || [];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Dashboard</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>Vue d'ensemble en temps réel</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={FileText} label="Total articles" value={totalArticles} color="#FFE213" sub="Tous statuts confondus" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={Eye} label="Publiés" value={published} color="#22C55E" sub={totalArticles > 0 ? `${Math.round(published / totalArticles * 100)}% du contenu` : ''} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={Search} label="Brouillons" value={drafts} color="#F59E0B" sub={drafts > 0 ? 'En attente de relecture' : 'Aucun brouillon'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={TrendingUp} label="Vidéos" value={videos} color="#6366F1" sub={`${totalArticles > 0 ? Math.round(videos / totalArticles * 100) : 0}% du contenu`} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Activité récente */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Activity size={18} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Activité récente</Typography>
            </Box>
            {recentArticles.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>Aucune activité récente</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {recentArticles.map((a: any, i: number) => (
                  <Box key={a.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={14} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Clock size={12} />
                          {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Chip label={a.status === 'published' ? 'Publié' : a.status === 'draft' ? 'Brouillon' : a.status === 'scheduled' ? 'Planifié' : 'Archivé'}
                        size="small" sx={{ fontWeight: 600, bgcolor: statusBg(a.status, isDark), color: statusColor(a.status), textTransform: 'capitalize' }} />
                    </Box>
                    {i < recentArticles.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* SEO & Infos */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Search size={18} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>SEO & Social Media</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <SEOField label="Blog meta description" value="Blog sur l'IA, Microsoft Learn, Power Platform, Cloud, DevOps" />
              <SEOField label="URL canonique" value="https://benji-aka-dev.site" />
              <SEOField label="Liens sociaux" value="GitHub, LinkedIn, X/Twitter" />
              <SEOField label="Dernière mise à jour" value={articles?.[0]?.created_at ? new Date(articles[0].created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
              <SEOField label="Page de profil" value={`/${articles?.[0]?.author_id || '…'}`} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function statusColor(s: string) {
  const m: Record<string, string> = { draft: '#F59E0B', scheduled: '#3B82F6', published: '#22C55E', archived: '#6B7280' };
  return m[s] || '#6B7280';
}

function statusBg(s: string, isDark: boolean) {
  return `${statusColor(s)}${isDark ? '20' : '15'}`;
}

function SEOField({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25, px: 2, borderRadius: '10px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>{value}</Typography>
    </Box>
  );
}
