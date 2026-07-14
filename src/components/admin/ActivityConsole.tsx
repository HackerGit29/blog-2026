import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'processing';
  message: string;
  timestamp: string;
}

const mockEvents = [
  "Initialisation du module blog...",
  "Chargement des articles publiés...",
  "Analyse des catégories...",
  "Préparation des ressources Microsoft Learn...",
  "Synchronisation des projets GitHub...",
  "Interface prête."
];

export function ActivityConsole({ onComplete }: { onComplete?: () => void }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < mockEvents.length) {
        setEvents(prev => [...prev, {
          id: Date.now().toString(),
          type: currentIndex === mockEvents.length - 1 ? 'success' : 'processing',
          message: mockEvents[currentIndex],
          timestamp: new Date().toLocaleTimeString()
        }]);
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 800);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <Box 
      sx={{ 
        bgcolor: '#0D0D0D', 
        color: '#E0E0E0',
        p: 3, 
        borderRadius: 2,
        fontFamily: 'monospace',
        minHeight: 200,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
        border: '1px solid #333'
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
      </Box>
      <AnimatePresence>
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="body2" sx={{ fontFamily: 'inherit', mb: 0.5 }}>
              <span style={{ color: '#888' }}>[{event.timestamp}]</span>{' '}
              <span style={{ color: event.type === 'success' ? '#27C93F' : '#00A4EF' }}>
                {event.message}
              </span>
            </Typography>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}
