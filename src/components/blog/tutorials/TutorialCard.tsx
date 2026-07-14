import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CodeIcon from '@mui/icons-material/Code';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getTutorialEnhancement } from '../../../data/tutorialEnhancements';

export interface TutorialCardProps {
  article: any;
  index: number;
}

export function TutorialCard({ article, index }: TutorialCardProps) {
  const navigate = useNavigate();
  const enhancement = getTutorialEnhancement(article.slug);

  const formattedDate = article.published_at 
    ? new Date(article.published_at).toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
    >
      <Card 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          cursor: 'pointer',
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: 'none',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 8px 30px rgba(var(--mui-palette-primary-mainChannel), 0.05)'
          }
        }}
        onClick={() => navigate(`/blog/${article.slug}`)}
      >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="190"
          image={article.image_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={article.title}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        />
        
        {/* Category Badge & Level Overlay */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          {article.blog_categories && (
            <Chip 
              label={article.blog_categories.name} 
              size="small" 
              sx={{ 
                bgcolor: 'background.paper', 
                border: '1px solid',
                borderColor: 'divider',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: 'text.primary'
              }} 
            />
          )}
          <Chip 
            label={enhancement.level} 
            size="small" 
            color={enhancement.level === 'Débutant' ? 'success' : enhancement.level === 'Intermédiaire' ? 'primary' : 'warning'}
            sx={{ 
              fontWeight: 700,
              fontSize: '0.75rem',
              px: 0.5
            }} 
          />
        </Box>

        {/* Video Duration Badge */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 12, 
            right: 12, 
            bgcolor: 'rgba(0, 0, 0, 0.75)', 
            backdropFilter: 'blur(4px)',
            color: 'white', 
            px: 1, 
            py: 0.5, 
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          {enhancement.durationText || '10:00'}
        </Box>

        {/* Play Icon Overlay */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.15)',
          transition: 'all 0.2s',
          opacity: 0,
          '&:hover': { opacity: 1 }
        }}>
          <PlayCircleIcon sx={{ color: 'white', fontSize: 52, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' }} />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        {/* Title */}
        <Typography 
          gutterBottom 
          variant="subtitle1" 
          component="h2" 
          sx={{ fontWeight: 800, lineHeight: 1.4, mb: 1, fontSize: '1rem', minHeight: '2.8em' }}
        >
          {article.title}
        </Typography>

        {/* Summary Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2.5, 
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: '0.825rem',
            minHeight: '3em'
          }}
        >
          {article.summary || "Apprenez en pratiquant à l'aide de ce tutoriel complet."}
        </Typography>

        {/* Structured badges list */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
          <Chip 
            icon={<AssignmentIcon sx={{ fontSize: '14px !important' }} />}
            label={`${enhancement.steps.length} étapes`} 
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.725rem', borderColor: 'divider' }}
          />
          {enhancement.codeSnippets.length > 0 && (
            <Chip 
              icon={<CodeIcon sx={{ fontSize: '14px !important' }} />}
              label="Code inclus" 
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.725rem', borderColor: 'divider' }}
            />
          )}
          {enhancement.transcript && (
            <Chip 
              icon={<SubtitlesIcon sx={{ fontSize: '14px !important' }} />}
              label="Transcription" 
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.725rem', borderColor: 'divider' }}
            />
          )}
        </Box>

        {/* Action Button & Date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {formattedDate}
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            size="small"
            endIcon={<PlayCircleIcon sx={{ fontSize: 16 }} />}
            sx={{ 
              borderRadius: '24px', 
              textTransform: 'none', 
              fontWeight: 700,
              fontSize: '0.8rem',
              px: 2
            }}
          >
            Suivre le tutoriel
          </Button>
        </Box>
      </CardContent>
    </Card>
   </motion.div>
  );
}
