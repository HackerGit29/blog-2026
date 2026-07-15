import React, { useState } from 'react';
import { Box, Typography, Button, TextField, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { ArticleCard } from '../../components/blog/ArticleCard';
import { Search } from 'lucide-react';

export function AdminVideos() {
  const [search, setSearch] = useState('');
  const { data } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_articles')
        .select('*, blog_categories(name)')
        .eq('media_type', 'video')
        .order('created_at', { ascending: false });
      return (data || []) as any[];
    },
  });
  const videos = (data || []).filter((v: any) => !search || v.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Vidéos</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{videos.length} tutoriels vidéo</Typography>
        </Box>
        <TextField
          size="small" placeholder="Rechercher..."
          value={search} onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <Search size={16} style={{ marginRight: 8 }} /> } }}
          sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: '30px' } }}
        />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
        {videos.map((v: any) => (
          <ArticleCard key={v.id} article={v} />
        ))}
      </Box>
      {videos.length === 0 && (
        <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>
          Aucune vidéo trouvée
        </Typography>
      )}
    </Box>
  );
}
