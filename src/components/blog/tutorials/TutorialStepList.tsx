import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { TutorialStep } from '../../../data/tutorialEnhancements';

export interface TutorialStepListProps {
  steps: TutorialStep[];
}

export function TutorialStepList({ steps }: TutorialStepListProps) {
  // Keeping track of completion status per step
  const [stepStatus, setStepStatus] = useState<Record<string, 'todo' | 'active' | 'done'>>(() => {
    const initial: Record<string, 'todo' | 'active' | 'done'> = {};
    steps.forEach((step, index) => {
      initial[step.id] = index === 0 ? 'active' : 'todo';
    });
    return initial;
  });

  const toggleStatus = (stepId: string) => {
    setStepStatus(prev => {
      const current = prev[stepId];
      let next: 'todo' | 'active' | 'done' = 'todo';
      if (current === 'todo') next = 'active';
      else if (current === 'active') next = 'done';
      return { ...prev, [stepId]: next };
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, my: 2 }}>
      {steps.map((step, index) => {
        const status = stepStatus[step.id] || 'todo';

        return (
          <Card 
            key={step.id}
            sx={{ 
              borderRadius: '16px',
              border: '1px solid',
              borderColor: status === 'active' ? 'primary.main' : 'divider',
              boxShadow: status === 'active' ? '0 8px 30px rgba(var(--mui-palette-primary-mainChannel), 0.08)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {/* Step Number Badge */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: -14,
                left: 20,
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: status === 'done' ? 'success.main' : status === 'active' ? 'primary.main' : 'grey.300',
                color: status === 'done' || status === 'active' ? 'white' : 'grey.700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: '3px solid',
                borderColor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {index + 1}
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 4 }, pt: 3 }}>
              {/* Header */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  gap: 2, 
                  mb: 2 
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, pl: { sm: 1.5 }, fontSize: '1.1rem' }}>
                  {step.title}
                </Typography>

                {/* Status Toggle & Duration */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: { xs: 0, sm: 'auto' } }}>
                  {step.duration && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {step.duration}
                      </Typography>
                    </Box>
                  )}

                  <Chip
                    icon={
                      status === 'done' ? (
                        <CheckCircleIcon sx={{ fontSize: '16px !important' }} />
                      ) : status === 'active' ? (
                        <PlayArrowIcon sx={{ fontSize: '16px !important' }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: '16px !important' }} />
                      )
                    }
                    label={
                      status === 'done' ? 'Terminé' : status === 'active' ? 'En cours' : 'À faire'
                    }
                    color={
                      status === 'done' ? 'success' : status === 'active' ? 'primary' : 'default'
                    }
                    size="small"
                    onClick={() => toggleStatus(step.id)}
                    sx={{ 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      px: 0.5,
                      '&:hover': { opacity: 0.9 }
                    }}
                  />
                </Box>
              </Box>

              {/* Description */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 0, 
                  lineHeight: 1.6, 
                  pl: { sm: 1.5 },
                  fontSize: '0.925rem'
                }}
              >
                {step.description}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
