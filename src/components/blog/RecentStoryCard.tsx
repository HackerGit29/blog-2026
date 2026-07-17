import React from 'react';
import { Typography, Box, Chip, IconButton, Avatar } from '@mui/material';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { DISPLAY_DATE, getAuthor } from './ArticleCard';

export function RecentStoryCard({ article }: { article: any }) {
  const navigate = useNavigate();
  const { user } = useParams<{ user: string }>();
  const base = `/${user ?? 'admin'}`;
  const author = getAuthor(article);

  if (!article) return null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => navigate(`${base}/blog/${article.slug}`)}
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
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={author.avatar || undefined} alt={author.name} sx={{ width: 22, height: 22, fontSize: 11, border: '1.5px solid #fff' }}>
            {author.name.charAt(0)}
          </Avatar>
           <Typography variant="caption" sx={{ 
             bgcolor: 'background.paper', 
             color: 'text.primary',
             px: 1.5, 
             py: 0.5, 
             borderRadius: '4px',
             fontWeight: 600,
             display: 'inline-block'
           }}>
             {author.name} / {DISPLAY_DATE} / 2 likes
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
