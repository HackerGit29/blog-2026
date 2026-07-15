import React, { useRef } from 'react';
import { Box, Stack, Typography, Button, IconButton, Avatar } from '@mui/material';
import { Sparkles, Mail, Bell, Zap } from 'lucide-react';
import { NAV_LINKS } from '../../data/portfolio';
import { Magnetic } from './Magnetic';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .from(linksRef.current?.children || [], {
      y: -10,
      opacity: 0,
      stagger: 0.1,
      duration: 0.4,
      ease: 'power2.out'
    }, "-=0.3")
    .from(actionsRef.current?.children || [], {
      x: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.4,
      ease: 'power2.out'
    }, "-=0.4");

  }, { scope: headerRef });

  return (
    <Box 
      component="header"
      ref={headerRef}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 4,
        mb: 3
      }}
    >
      <Stack ref={linksRef} direction="row" gap={5} sx={{ alignItems: 'center', justifyContent: 'center', display: { xs: 'none', md: 'flex' }, flex: 2 }}>
      </Stack>

      <Stack ref={actionsRef} direction="row" gap={2} sx={{ alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
        <Magnetic magneticPull={0.3}>
          <IconButton size="small" sx={{ color: 'text.primary', display: { xs: 'none', sm: 'inline-flex' } }}>
            <Mail size={22} />
          </IconButton>
        </Magnetic>
        <Magnetic magneticPull={0.3}>
          <IconButton size="small" sx={{ color: 'text.primary', position: 'relative' }}>
            <Bell size={22} />
            <Box sx={{ 
              position: 'absolute', 
              top: 4, 
              right: 6, 
              width: 10, 
              height: 10, 
              bgcolor: '#FF5A1F', 
              borderRadius: '50%',
              border: '2px solid #09090B'
            }} />
          </IconButton>
        </Magnetic>
        <Magnetic magneticPull={0.1}>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ 
              display: { xs: 'none', sm: 'inline-flex' },
              px: 3.5,
              py: 1,
              ml: 1
            }}
          >
            Uploader
          </Button>
        </Magnetic>
      </Stack>
    </Box>
  );
}
