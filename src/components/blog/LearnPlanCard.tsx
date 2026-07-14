import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, useTheme } from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { motion } from 'motion/react';
import { LearnPlan } from '../../data/learnPlans';
import { appendContributorId } from '../../lib/learnLinks';

export interface LearnPlanCardProps {
  plan: LearnPlan;
  index: number;
}

export function LearnPlanCard({ plan, index }: LearnPlanCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
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
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
          bgcolor: isDark ? 'background.paper' : '#ECE7DB',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#1A1A1A',
          borderRadius: '24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.6)' : '0 10px 25px rgba(0,0,0,0.08)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.24)' : '#1A1A1A',
          }
        }}
      >
        <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
          {/* Top Badges */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={plan.level} 
              size="small" 
              variant="outlined" 
              color="primary"
              sx={{ fontWeight: 700 }}
            />
            <Chip 
              label={plan.duration} 
              size="small" 
              variant="outlined"
              sx={{ 
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#1A1A1A', 
                fontWeight: 600,
                color: 'text.primary',
                bgcolor: 'transparent'
              }} 
            />
          </Box>

          {/* Title */}
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1.5, color: 'text.primary' }}
          >
            {plan.title}
          </Typography>

          {/* Description */}
          <Typography 
            variant="body2" 
            sx={{ mb: 2.5, flexGrow: 1, lineHeight: 1.6, color: 'text.secondary', fontWeight: 500 }}
          >
            {plan.description}
          </Typography>

          {/* Topics */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3.5, flexWrap: 'wrap' }}>
            {plan.topics.map(topic => (
              <Chip 
                key={topic} 
                label={topic} 
                size="small" 
                sx={{ 
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)', 
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#1A1A1A', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  color: 'text.primary'
                }} 
              />
            ))}
          </Box>

          {/* Action Button */}
          <Button 
            variant="contained" 
            color="primary"
            fullWidth
            endIcon={<OpenInNew />}
            href={appendContributorId(plan.url)}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              mt: 'auto', 
              py: 1.5,
              fontSize: '0.95rem',
            }}
          >
            Commencer le plan
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
