import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import BookIcon from '@mui/icons-material/Book';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { TutorialResource } from '../../../data/tutorialEnhancements';
import { appendContributorId } from '../../../lib/learnLinks';

export interface TutorialResourceCardProps {
  resource: TutorialResource;
}

export function TutorialResourceCard({ resource }: TutorialResourceCardProps) {
  const isLearn = resource.type === 'learn';
  
  // Format link with tracking contributor ID for Microsoft Learn links
  const targetUrl = isLearn ? appendContributorId(resource.url) : resource.url;

  const getIcon = () => {
    switch (resource.type) {
      case 'learn':
        return <SchoolIcon sx={{ color: 'primary.main', fontSize: 24 }} />;
      case 'github':
        return <GitHubIcon sx={{ color: 'text.primary', fontSize: 24 }} />;
      case 'docs':
        return <DescriptionIcon sx={{ color: 'info.main', fontSize: 24 }} />;
      case 'file':
        return <InsertDriveFileIcon sx={{ color: 'warning.main', fontSize: 24 }} />;
      case 'article':
        return <BookIcon sx={{ color: 'secondary.main', fontSize: 24 }} />;
      default:
        return <OpenInNewIcon sx={{ color: 'text.secondary', fontSize: 24 }} />;
    }
  };

  const getBadgeLabel = () => {
    switch (resource.type) {
      case 'learn':
        return 'Microsoft Learn';
      case 'github':
        return 'GitHub';
      case 'docs':
        return 'Documentation';
      case 'file':
        return 'Fichier / Téléchargement';
      case 'article':
        return 'Article Associé';
      default:
        return 'Ressource';
    }
  };

  const getBadgeColor = () => {
    switch (resource.type) {
      case 'learn':
        return 'primary';
      case 'github':
        return 'default';
      case 'docs':
        return 'info';
      case 'file':
        return 'warning';
      case 'article':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2.5, 
        borderRadius: '14px', 
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'none',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 15px rgba(var(--mui-palette-primary-mainChannel), 0.05)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
        {/* Resource Icon */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 48, 
            height: 48, 
            borderRadius: '10px', 
            bgcolor: 'action.hover'
          }}
        >
          {getIcon()}
        </Box>

        {/* Content Info */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Chip 
            label={getBadgeLabel()} 
            size="small" 
            color={getBadgeColor() as any}
            sx={{ fontWeight: 700, mb: 0.5, height: 20, fontSize: '0.7rem' }}
          />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 800, 
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {resource.label}
          </Typography>
        </Box>

        {/* Link Button */}
        <Button 
          variant="outlined" 
          color="inherit" 
          size="small"
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
          sx={{ 
            borderRadius: '24px', 
            borderColor: 'divider', 
            textTransform: 'none',
            flexShrink: 0,
            px: 2,
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          Ouvrir
        </Button>
      </Box>
    </Card>
  );
}
