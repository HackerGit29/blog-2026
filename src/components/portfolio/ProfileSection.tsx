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
  <Stack sx={{ alignItems: { xs: 'center', md: 'center' } }} gap={0.5}>
    <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h2" fontWeight={700} sx={{ letterSpacing: '-1px', color: 'text.primary' }}>
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

    gsap.from(textRef.current?.children || [], {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2
    });

    gsap.from('.badge-svg', {
      scale: 0,
      opacity: 0,
      rotation: -90,
      stagger: 0.1,
      duration: 1,
      ease: "back.out(2)",
      delay: 0.5
    });

    gsap.utils.toArray('.badge-svg').forEach((badge: any, index: number) => {
      gsap.to(badge, {
        y: -6,
        duration: 1.5 + index * 0.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: index * 0.15
      });
    });

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
         <Stack direction="row" gap={2} mb={1} sx={{ alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <Typography variant="h2" fontWeight={700} sx={{ letterSpacing: '-1.5px', color: 'text.primary' }}>
              {PROFILE_DATA.name}
            </Typography>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #7A5BFF, #A18BFF)', 
              color: 'white', 
              px: 1.5, 
              py: 0.5, 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              mt: 1
            }}>
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.8rem', letterSpacing: '1px' }}>PRO</Typography>
              <Zap size={14} fill="white" />
            </Box>
         </Stack>
         
         <Typography variant="body1" color="text.primary" sx={{ fontSize: '1.25rem', maxWidth: 400, mx: { xs: 'auto', md: 0 }, lineHeight: 1.5, mb: 4, opacity: 0.9 }}>
           {PROFILE_DATA.title}<br/>{PROFILE_DATA.location}
         </Typography>

         <Stack direction="row" gap={2} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
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
         <Stack direction="row" gap={2.5} sx={{ position: 'relative', alignItems: 'center' }}>
           <Magnetic magneticPull={0.25}>
             <Box 
               component="a"
               href={PROFILE_DATA.socials.discord}
               target="_blank"
               rel="noopener noreferrer"
               className="badge-svg" 
               sx={{ 
                 width: 52, 
                 height: 52, 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 borderRadius: '50%',
                 backgroundColor: 'rgba(88, 101, 242, 0.1)',
                 border: '1px solid rgba(88, 101, 242, 0.25)',
                 transition: 'all 0.3s ease',
                 cursor: 'pointer',
                 p: 1.2,
                 '&:hover': {
                   backgroundColor: 'rgba(88, 101, 242, 0.2)',
                   transform: 'scale(1.1) translateY(-2px)',
                   boxShadow: '0 8px 20px rgba(88, 101, 242, 0.3)'
                 }
               }}
             >
               <svg width="100%" height="100%" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <g clipPath="url(#clip0-discord)">
                   <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="#5865F2" />
                 </g>
                 <defs>
                   <clipPath id="clip0-discord">
                     <rect width="71" height="55" fill="white" />
                   </clipPath>
                 </defs>
               </svg>
             </Box>
           </Magnetic>

           <Magnetic magneticPull={0.25}>
             <Box 
               component="a"
               href={PROFILE_DATA.socials.github}
               target="_blank"
               rel="noopener noreferrer"
               className="badge-svg" 
               sx={{ 
                 width: 52, 
                 height: 52, 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 borderRadius: '50%',
                 backgroundColor: 'rgba(255, 255, 255, 0.08)',
                 border: '1px solid rgba(255, 255, 255, 0.15)',
                 transition: 'all 0.3s ease',
                 cursor: 'pointer',
                 p: 1.2,
                 '&:hover': {
                   backgroundColor: 'rgba(255, 255, 255, 0.15)',
                   transform: 'scale(1.1) translateY(-2px)',
                   boxShadow: '0 8px 20px rgba(255, 255, 255, 0.15)'
                 }
               }}
             >
               <svg width="100%" height="100%" viewBox="0 0 98 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <g clipPath="url(#clip0-github)">
                   <path d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 6.69539e-07 48.9043 4.309e-07C21.8203 1.92261e-07 -1.9479e-07 22.1074 -4.3343e-07 49.1914C-6.20631e-07 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z" fill="#FFFFFF" />
                 </g>
                 <defs>
                   <clipPath id="clip0-github">
                     <rect width="98" height="96" fill="white" />
                   </clipPath>
                 </defs>
               </svg>
             </Box>
           </Magnetic>

           <Magnetic magneticPull={0.25}>
             <Box 
               component="a"
               href={PROFILE_DATA.socials.instagram}
               target="_blank"
               rel="noopener noreferrer"
               className="badge-svg" 
               sx={{ 
                 width: 52, 
                 height: 52, 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 borderRadius: '50%',
                 backgroundColor: 'rgba(251, 173, 80, 0.08)',
                 border: '1px solid rgba(251, 173, 80, 0.2)',
                 transition: 'all 0.3s ease',
                 cursor: 'pointer',
                 p: 1.2,
                 '&:hover': {
                   backgroundColor: 'rgba(251, 173, 80, 0.15)',
                   transform: 'scale(1.1) translateY(-2px)',
                   boxShadow: '0 8px 20px rgba(225, 48, 108, 0.3)'
                 }
               }}
             >
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="#E1306C"/>
                </svg>
             </Box>
           </Magnetic>
         </Stack>

         <Stack direction="row" gap={{ xs: 3, sm: 6 }} mt={2}>
           <StatBox value={PROFILE_DATA.followers} label="Abonnés" />
           <StatBox value={PROFILE_DATA.following} label="Abonnements" />
           <StatBox value={PROFILE_DATA.likes} label="J'aime" />
         </Stack>
      </Box>
    </Box>
  );
}
