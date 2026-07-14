import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';
import { Add } from '@mui/icons-material';
import { BlogLayout } from '../components/blog/BlogLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { ActivityConsole } from '../components/admin/ActivityConsole';

export function AdminContent() {
  const [showConsole, setShowConsole] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin_articles_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_articles')
        .select('*, blog_categories(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const articles = data as any[];

  const handleSimulatePublish = () => {
    setShowConsole(true);
    // Simulate events
  };

  return (
    <BlogLayout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Gestion du contenu
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleSimulatePublish}>
            Simuler IA
          </Button>
        </Box>

        {showConsole && (
          <Box sx={{ mb: 4 }}>
            <ActivityConsole 
              onComplete={() => setTimeout(() => setShowConsole(false), 3000)}
            />
          </Box>
        )}

        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>Chargement...</TableCell>
                </TableRow>
              ) : articles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>Aucun article trouvé.</TableCell>
                </TableRow>
              ) : (
                articles?.map((article) => (
                  <TableRow key={article.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{article.title}</TableCell>
                    <TableCell>{article.blog_categories?.name || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={article.status} 
                        size="small" 
                        color={article.status === 'published' ? 'success' : 'default'} 
                      />
                    </TableCell>
                    <TableCell>
                      {article.media_type === 'video' ? 'Vidéo' : 'Article'}
                    </TableCell>
                    <TableCell>
                      {article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </BlogLayout>
  );
}
