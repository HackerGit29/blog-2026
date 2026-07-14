import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Grid, Divider } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { TutorialEnhancement } from '../../../data/tutorialEnhancements';
import { TutorialVideoPlayer } from './TutorialVideoPlayer';
import { TutorialStepList } from './TutorialStepList';
import { TutorialResourceCard } from './TutorialResourceCard';
import { TutorialToolsPanel } from './TutorialToolsPanel';
import { motion } from 'motion/react';

export interface TutorialWorkspaceProps {
  videoUrl?: string;
  imageUrl?: string;
  title: string;
  enhancement: TutorialEnhancement;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tutorial-tabpanel-${index}`}
      aria-labelledby={`tutorial-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function TutorialWorkspace({ videoUrl, imageUrl, title, enhancement }: TutorialWorkspaceProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', mb: 6 }}>
      {/* Title & Video Row */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em' }}>
          {title}
        </Typography>
        <TutorialVideoPlayer 
          videoUrl={videoUrl || undefined} 
          poster={imageUrl || undefined} 
          title={title} 
        />
      </Box>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="tutorial interactive workspace tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              minWidth: 'auto',
              px: { xs: 2, sm: 3 },
              py: 2,
              gap: 1
            }
          }}
        >
          <Tab icon={<AssignmentIcon sx={{ fontSize: 18 }} />} label="Résumé" />
          <Tab icon={<ListAltIcon sx={{ fontSize: 18 }} />} label="Chapitres" />
          <Tab icon={<FolderZipIcon sx={{ fontSize: 18 }} />} label="Ressources associées" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <CustomTabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              Objectifs d'apprentissage
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {enhancement.objectives.map((obj, i) => (
                <Typography component="li" key={i} variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {obj}
                </Typography>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              Prérequis
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {enhancement.prerequisites.map((req, i) => (
                <Typography component="li" key={i} variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {req}
                </Typography>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        <TutorialStepList steps={enhancement.steps} />
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={2}>
        <Grid container spacing={2.5}>
          {enhancement.resources.map((resource, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <TutorialResourceCard resource={resource} />
            </Grid>
          ))}
        </Grid>
      </CustomTabPanel>
    </Box>
  );
}
