import React from 'react';
import { Card, Typography, Box, Chip, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

export function HighlightedArticleCard({ article }: { article: any }) {
  const navigate = useNavigate();
  const { user } = useParams<{ user: string }>();
  const base = `/${user ?? 'admin'}`;

  if (!article) return null;

  const formattedDate = article.published_at 
    ? new Date(article.published_at).toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <Card sx={{ 
      borderRadius: '24px', 
      p: 4, 
      height: '100%', 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center' }}>
        {article.blog_categories && (
          <Chip label={article.blog_categories.name} variant="outlined" size="small" />
        )}
        {article.media_type === 'video' && (
           <Chip label="Vidéo" variant="outlined" size="small" />
        )}
      </Box>
      <Typography align="center" variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary', fontWeight: 600 }}>
        Benji • {formattedDate}
      </Typography>
      <Typography align="center" variant="h5" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.3 }}>
        {article.title}
      </Typography>
      {article.summary && (
        <Typography align="center" variant="body2" sx={{ color: 'text.secondary', mb: 4, flexGrow: 1 }}>
          {article.summary}
        </Typography>
      )}
      <Box sx={{ textAlign: 'center' }}>
        <Button 
          variant="contained" 
          onClick={() => navigate(`${base}/blog/${article.slug}`)}
          sx={{ px: 4, py: 1 }}
        >
          Lire la suite
        </Button>
      </Box>
    </Card>
  );
}
