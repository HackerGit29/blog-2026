import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, IconButton, Avatar } from '@mui/material';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import PlayArrow from '@mui/icons-material/PlayArrow';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';

export const DISPLAY_DATE = '14 juillet 2026';

export function getAuthor(article: any) {
  return {
    name: article?.author?.name || 'Benji',
    avatar: article?.author?.avatar_url || '',
    username: article?.author?.username || '',
  };
}

export interface ArticleCardProps {
  article: any;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const navigate = useNavigate();
  const { user } = useParams<{ user: string }>();
  const base = `/${user ?? 'admin'}`;
  const author = getAuthor(article);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
    >
      <Card 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => navigate(`${base}/blog/${article.slug}`)}
      >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={featured ? 220 : 180}
          image={article.image_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={article.title}
          sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}
        />
        
        {/* Top Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          {article.blog_categories && (
            <Chip 
              label={article.blog_categories.name} 
              size="small" 
              variant="outlined"
              sx={{ 
                fontWeight: 600
              }} 
            />
          )}
          {article.media_type === 'video' && (
            <Chip 
              label="Vidéo" 
              size="small" 
              variant="outlined"
              sx={{ fontWeight: 600 }} 
            />
          )}
        </Box>
        
        {/* Bookmark Icon */}
        <IconButton 
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12, 
            bgcolor: 'background.paper', 
            border: '1px solid', 
            borderColor: 'divider', 
            '&:hover': { bgcolor: 'action.hover' }, 
            width: 32, 
            height: 32 
          }}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            // handle bookmark
          }}
        >
          <BookmarkBorder sx={{ color: 'text.primary', fontSize: 18 }} />
        </IconButton>

        {/* Play Icon Overlay if video */}
        {article.media_type === 'video' && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.1)'
          }}>
            <PlayArrow sx={{ color: 'white', fontSize: 48, opacity: 0.9 }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5, bgcolor: 'transparent' }}>
        <Typography 
          gutterBottom 
          variant="subtitle1" 
          component="h2" 
          sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1.5 }}
        >
          {article.title}
        </Typography>
        
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar src={author.avatar || undefined} alt={author.name} sx={{ width: 28, height: 28, fontSize: 14, bgcolor: 'primary.main' }}>
            {author.name.charAt(0)}
          </Avatar>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {author.name} • {DISPLAY_DATE}
          </Typography>
        </Box>
      </CardContent>
    </Card>
   </motion.div>
  );
}
