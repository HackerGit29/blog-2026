import React from 'react';
import { Box, Typography, Chip, Card, CardContent } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

export interface TutorialToolsPanelProps {
  tools: string[];
}

export function TutorialToolsPanel({ tools }: TutorialToolsPanelProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <Card 
      sx={{ 
        borderRadius: '16px', 
        border: '1px solid', 
        borderColor: 'divider', 
        boxShadow: 'none', 
        bgcolor: 'background.paper' 
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <ConstructionIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Outils Utilisés
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {tools.map((tool) => (
            <Chip 
              key={tool} 
              label={tool} 
              variant="outlined" 
              size="small"
              sx={{ 
                fontWeight: 600, 
                fontSize: '0.775rem',
                bgcolor: 'action.hover',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.selected' }
              }} 
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
