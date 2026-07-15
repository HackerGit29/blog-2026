import React, { useRef } from 'react';
import { Box, Stack, Typography, Button, Avatar } from '@mui/material';
import { Zap } from 'lucide-react';
import { PROFILE_DATA } from '../../data/portfolio';
import { motion } from 'motion/react';
import { Magnetic } from './Magnetic';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(MotionPathPlugin, Draggable);

const StatBox = ({ value, label }: { value: string; label: string }) => (
  <Stack sx={{ alignItems: { xs: 'center', md: 'center' }, gap: 0.5 }}>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography variant="h2" sx={{ letterSpacing: '-1px', color: 'text.primary', fontWeight: 700 }}>
      {value}
    </Typography>
  </Stack>
);

export function ProfileSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(avatarRef.current, { 
      rotationY: 180, 
      opacity: 0 
    }, { 
      rotationY: 0, 
      opacity: 1, 
      duration: 1.5, 
      ease: "elastic.out(1, 0.5)", 
      delay: 0.2 
    });

    const textChildren = textRef.current?.children;
    if (textChildren?.length) {
      gsap.from(textChildren, {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      });
    }

    const badges = gsap.utils.toArray('.badge-svg');
    if (badges.length) {
      gsap.from(badges, {
        scale: 0,
        opacity: 0,
        rotation: -90,
        stagger: 0.1,
        duration: 1,
        ease: "back.out(2)",
        delay: 0.5
      });

      gsap.set(badges, { transformOrigin: 'center center' });

      const order = ['.instagram-badge', '.github-badge', '.discord-badge'];
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 6 });

      order.forEach((selector) => {
        const el = containerRef.current?.querySelector(selector);
        if (!el) return;
        tl.to(el, {
          y: -80,
          rotation: 360,
          duration: 0.7,
          ease: 'power2.out'
        })
        .to(el, {
          y: 0,
          duration: 0.5,
          ease: 'bounce.out'
        })
        .to({}, { duration: 1.5 });
      });
    }

  }, { scope: containerRef });

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        alignItems: { xs: 'center', md: 'center' }, 
        gap: { xs: 4, md: 6 }, 
        mb: 8
      }}
    >
      <Box ref={avatarRef} sx={{ position: 'relative', flexShrink: 0 }}>
         <Avatar 
           src={PROFILE_DATA.avatarUrl} 
           alt={PROFILE_DATA.name}
           sx={{ 
             width: { xs: 200, md: 280 }, 
             height: { xs: 200, md: 280 }, 
             borderRadius: '35%',
             boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
           }} 
         />
      </Box>

      <Box ref={textRef} sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
         <Stack direction="row" sx={{ gap: 2, mb: 1, alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <Typography variant="h2" sx={{ letterSpacing: '-1.5px', color: 'text.primary', fontWeight: 700 }}>
              {PROFILE_DATA.name}
            </Typography>
            <Box
              component="img"
              src="/assets/verification-badge.svg"
              alt="Verified"
              sx={{ width: 28, height: 28, mt: 1 }}
            />
         </Stack>
         
         <Typography variant="body1" color="text.primary" sx={{ fontSize: '1.25rem', maxWidth: 400, mx: { xs: 'auto', md: 0 }, lineHeight: 1.5, mb: 4, opacity: 0.9 }}>
           {PROFILE_DATA.title}<br/>{PROFILE_DATA.location}
         </Typography>

         <Stack direction="row" sx={{ gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
           <Magnetic>
             <Button variant="contained" color="primary" size="large" sx={{ px: 5, py: 1.2 }}>
               Suivre
             </Button>
           </Magnetic>
           <Magnetic magneticPull={0.15}>
             <Button variant="outlined" size="large" sx={{ px: 5, py: 1.2 }}>
               Contacter
             </Button>
           </Magnetic>
         </Stack>
      </Box>

      <Box ref={badgesRef} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-end' }, gap: 4 }}>
         <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>
           <Box
             component="a"
             href={PROFILE_DATA.socials.discord}
             target="_blank"
             rel="noopener noreferrer"
             className="badge-svg discord-badge"
             sx={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
           >
             <Box component="img" src="/assets/discord.svg" alt="Discord" sx={{ width: '100%', height: '100%' }} />
           </Box>
           <Box
             component="a"
             href={PROFILE_DATA.socials.github}
             target="_blank"
             rel="noopener noreferrer"
             className="badge-svg github-badge"
             sx={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
           >
             <Box component="img" src="/assets/github.svg" alt="GitHub" sx={{ width: '100%', height: '100%' }} />
           </Box>
           <Box
             component="a"
             href={PROFILE_DATA.socials.instagram}
             target="_blank"
             rel="noopener noreferrer"
             className="badge-svg instagram-badge"
             sx={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
           >
             <Box component="img" src="/assets/instagram.svg" alt="Instagram" sx={{ width: '100%', height: '100%' }} />
           </Box>
         </Stack>

         <Stack direction="row" sx={{ gap: { xs: 3, sm: 6 }, mt: 2 }}>
           <StatBox value={PROFILE_DATA.followers} label="Abonnés" />
           <StatBox value={PROFILE_DATA.following} label="Abonnements" />
           <StatBox value={PROFILE_DATA.likes} label="J'aime" />
         </Stack>
      </Box>
    </Box>
  );
}
