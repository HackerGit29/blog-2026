import { useState } from 'react';
import { Box, Typography, TextField, Paper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import { ArticleCard } from '../../components/blog/ArticleCard';
import { Search, Video } from 'lucide-react';

export function AdminVideos() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const { data } = useQuery({
    queryKey: ['admin-videos', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_articles')
        .select('*, blog_categories(name)')
        .eq('author_id', user!.id)
        .eq('media_type', 'video')
        .order('created_at', { ascending: false });
      return (data || []) as any[];
    },
    enabled: !!user,
  });
  const videos = (data || []).filter((v: any) => !search || v.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Vidéos</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{videos.length} tutoriel(s) vidéo</Typography>
        </Box>
        <TextField size="small" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <Search size={16} style={{ marginRight: 8 }} /> } }}
          sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: '30px' } }} />
      </Box>

      {videos.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
          <Video size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>Aucune vidéo trouvée</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {videos.map((v: any) => <ArticleCard key={v.id} article={v} />)}
        </Box>
      )}
    </Box>
  );
}
