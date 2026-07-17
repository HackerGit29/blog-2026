import React, { useRef } from 'react';
import { Box, Stack, Typography, Button, Avatar } from '@mui/material';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore, ProfileData } from '../../store/portfolio';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'motion/react';
import { Magnetic } from './Magnetic';
import { optimizedAvatar } from '../../lib/optimizedUrl';
import { FollowButton } from './FollowButton';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(MotionPathPlugin, Draggable);

const FollowerBox = ({ formattedCount, label }: { formattedCount: string; label: string }) => (
  <Stack sx={{ alignItems: 'center', gap: 0.5 }}>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography variant="h2" sx={{ letterSpacing: '-1px', color: 'text.primary', fontWeight: 700 }}>
      {formattedCount}
    </Typography>
  </Stack>
);

export function ProfileSection({ profileOverride }: { profileOverride?: ProfileData }) {
  const storeProfile = usePortfolioStore((s) => s.profile);
  // profileOverride (depuis /u/:userId) a la priorité sur le store
  const profile = profileOverride || storeProfile;
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Suivre/contacter ont du sens uniquement quand on visite le profil d'un autre
  // utilisateur et qu'on est connecté. Sinon → /login.
  const isOwnProfile = user?.user_metadata?.user_name === profile.username || user?.email === profile.username;
  const requiresAuth = !user;
  const guardedNavigate = (path: string) => {
    if (requiresAuth || isOwnProfile) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    navigate(path);
  };

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
            src={optimizedAvatar(profile.avatarUrl, 560)} 
            alt={profile.name}
            slotProps={{ img: { loading: 'lazy' } }}
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
            <Typography variant="h2" component="h1" sx={{ letterSpacing: '-1.5px', color: 'text.primary', fontWeight: 700 }}>
              {profile.name}
            </Typography>
            {profile.isVerified && (
              <Box
                component="img"
                src="/assets/verification-badge.svg"
                alt="Verified"
                sx={{ width: 28, height: 28, mt: 1 }}
              />
            )}
         </Stack>
         
         <Typography variant="body1" color="text.primary" sx={{ fontSize: '1.25rem', maxWidth: 400, mx: { xs: 'auto', md: 0 }, lineHeight: 1.5, mb: 4, opacity: 0.9 }}>
           {profile.title}<br/>{profile.location}
         </Typography>

         <Stack direction="row" sx={{ gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
           {!isOwnProfile && (
             <>
               <Magnetic>
                 <FollowButton
                   targetUsername={profile.username ?? ''}
                   isOwnProfile={isOwnProfile}
                   size="large"
                 />
               </Magnetic>
               <Magnetic magneticPull={0.15}>
                 <Button
                   variant="outlined"
                   size="large"
                   sx={{ px: 5, py: 1.2 }}
                   onClick={() => guardedNavigate(`/u/${profile.username ?? ''}/contact`)}
                 >
                   Contacter
                 </Button>
               </Magnetic>
             </>
           )}
         </Stack>
      </Box>

      <Box ref={badgesRef} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-end' }, gap: 4 }}>
         <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>
            <Box
              component="a"
              href={profile.socials.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="badge-svg discord-badge"
              sx={{ width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Box component="img" src="/assets/discord.svg" alt="Discord" width={90} height={90} />
            </Box>
            <Box
              component="a"
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="badge-svg github-badge"
              sx={{ width: 90, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Box component="img" src="/assets/github.svg" alt="GitHub" width={90} height={80} />
            </Box>
            <Box
              component="a"
              href={profile.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="badge-svg instagram-badge"
              sx={{ width: 78, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Box component="img" src="/assets/instagram.svg" alt="Instagram" width={78} height={80} />
            </Box>
         </Stack>

         <Stack direction="row" sx={{ gap: { xs: 3, sm: 6 }, mt: 2 }}>
           <FollowerBox formattedCount={profile.formattedFollowers || '0'} label="Abonnés" />
         </Stack>
      </Box>
    </Box>
  );
}
