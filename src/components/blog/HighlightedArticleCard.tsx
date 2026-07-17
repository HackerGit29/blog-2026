import React from 'react';
import { Card, Typography, Box, Chip, Button, Avatar } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DISPLAY_DATE, getAuthor } from './ArticleCard';

export function HighlightedArticleCard({ article }: { article: any }) {
  const navigate = useNavigate();
  const { user } = useParams<{ user: string }>();
  const base = `/${user ?? 'admin'}`;
  const author = getAuthor(article);

  if (!article) return null;

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
        <Avatar src={author.avatar || undefined} alt={author.name} sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}>
          {author.name.charAt(0)}
        </Avatar>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {author.name} • {DISPLAY_DATE}
        </Typography>
      </Box>
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
