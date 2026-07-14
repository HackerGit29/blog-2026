import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { motion } from 'motion/react';
import { VideoResource } from '../../data/videoResources';
import { getEmbedUrl } from '../../lib/videoUtils';

export interface VideoResourceCardProps {
  video: VideoResource;
  index: number;
}

export function VideoResourceCard({ video, index }: VideoResourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ delay: index * 0.1, duration: 0.2 }}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
    >
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          position: 'relative',
          boxShadow: 'none',
          overflow: 'hidden',
        }}
      >
      <Box sx={{ 
        position: 'relative', 
        paddingTop: '56.25%', 
        borderBottom: '1px solid', 
        borderBottomColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#1A1A1A' 
      }}>
        <iframe 
          src={getEmbedUrl(video.url)} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>

      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
        {/* Top Badges */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={video.category} 
            size="small" 
            variant="outlined"
          />
          {video.duration && (
            <Chip 
              label={video.duration} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>

        {/* Title */}
        <Typography 
          variant="subtitle1" 
          component="h3" 
          sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1.5 }}
        >
          {video.title}
        </Typography>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2, flexGrow: 1, lineHeight: 1.5 }}
        >
          {video.description}
        </Typography>
      </CardContent>
    </Card>
   </motion.div>
  );
}
