import React from 'react';
import { Box, Typography } from '@mui/material';
import { usePortfolioStore } from '../../store/portfolio';
import { Tabs, TabsList, TabsTrigger } from './AnimatedTabs';
import { motion } from 'motion/react';

const TABS = [
  { label: 'Travaux', count: 54, value: 'travaux' },
  { label: 'Moodboards', value: 'moodboards' },
  { label: "J'aime", value: 'jaime' },
  { label: 'À propos', value: 'apropos' },
];

export function ProjectTabs() {
  const { activeTab, setActiveTab } = usePortfolioStore();

  const handleValueChange = (value: string) => {
    const index = TABS.findIndex(t => t.value === value);
    if (index !== -1) setActiveTab(index);
  };

  const currentValue = TABS[activeTab]?.value || 'travaux';

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
                {tab.count !== undefined && (
                  <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, mt: -0.2 }}>
                    {tab.count}
                  </Typography>
                )}
              </Box>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </Box>
  );
}
