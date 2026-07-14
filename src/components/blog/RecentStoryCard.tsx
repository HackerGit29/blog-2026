import React from 'react';
import { Typography, Box, Chip, IconButton } from '@mui/material';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function RecentStoryCard({ article }: { article: any }) {
  const navigate = useNavigate();

  if (!article) return null;

  const formattedDate = article.published_at 
    ? new Date(article.published_at).toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/blog/${article.slug}`)}
      style={{ height: '100%', width: '100%' }}
    >
      <Box 
        sx={{ 
          position: 'relative', 
          borderRadius: '20px', 
          overflow: 'hidden', 
          height: '100%',
          minHeight: 380,
          width: '100%',
          cursor: 'pointer',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
      <Box 
        component="img" 
        src={article.image_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
        sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
      <Box sx={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)' 
      }} />
      
      <Box sx={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
        <Box sx={{ mb: 1.5 }}>
           <Typography variant="caption" sx={{ 
             bgcolor: 'background.paper', 
             color: 'text.primary',
             px: 1.5, 
             py: 0.5, 
             borderRadius: '4px',
             fontWeight: 600,
             display: 'inline-block'
           }}>
             Benji / {formattedDate} / 2 likes
           </Typography>
        </Box>
        <Typography variant="h5" sx={{ 
          color: '#fff', 
          fontWeight: 800, 
          lineHeight: 1.5,
          '& span': {
            bgcolor: '#1A1A1A',
            px: 1,
            py: 0.5,
            boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone',
          }
        }}>
          <span>{article.title}</span>
        </Typography>
      </Box>
     </Box>
    </motion.div>
  );
}
