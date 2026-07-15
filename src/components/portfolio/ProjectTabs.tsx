import React from 'react';
import { Box, Typography } from '@mui/material';
import { usePortfolioStore } from '../../store/portfolio';
import { Tabs, TabsList, TabsTrigger } from './AnimatedTabs';
import { motion } from 'motion/react';

const TABS = [
  { label: 'Blog', value: 'blog' },
  { label: 'Vidéos', value: 'videos' },
  { label: 'Ressources', value: 'ressources' },
  { label: 'À propos', value: 'apropos' },
];

export function ProjectTabs() {
  const { activeTab, setActiveTab } = usePortfolioStore();

  const handleValueChange = (value: string) => {
    const index = TABS.findIndex(t => t.value === value);
    if (index !== -1) setActiveTab(index);
  };

  const currentValue = TABS[activeTab]?.value || 'blog';

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      sx={{ width: '100%', mb: 5 }}
    >
      <Tabs value={currentValue} onValueChange={handleValueChange}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                <Typography component="span" sx={{ fontWeight: 'inherit', fontSize: 'inherit' }}>
                  {tab.label}
                </Typography>

              </Box>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </Box>
  );
}
