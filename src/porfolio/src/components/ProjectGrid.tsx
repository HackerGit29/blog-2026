import React, { useRef } from 'react';
import { Box, Stack, Typography, Grid, IconButton } from '@mui/material';
import { Heart, Eye } from 'lucide-react';
import { PROJECTS } from '../data';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  return (
    <Box 
      className="project-card"
      sx={{ opacity: 0, cursor: 'pointer', '&:hover .img-container': { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(0,0,0,0.06)' } }}
    >
      <Box 
        className="img-container"
        sx={{ 
          position: 'relative', 
          borderRadius: '32px', 
          overflow: 'hidden', 
          bgcolor: project.bgColor, 
          aspectRatio: '4/3', 
          mb: 2.5,
          transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <img 
          src={project.imageUrl} 
          alt={project.title}
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px' }} 
        />
        
        {/* Badges overlay */}
        {project.badges.length > 0 && (
          <Stack direction="row" gap={1} sx={{ position: 'absolute', top: 20, right: 20, zIndex: 2 }}>
            {project.badges.map((b, i) => (
              <Box 
                key={i} 
                sx={{ 
                  bgcolor: b.color, 
                  color: 'white', 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700, 
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                {b.text}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Card Info */}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', px: 1 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary', mb: 0.25, fontSize: '1.15rem' }}>
            {project.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
            {project.category}
          </Typography>
        </Box>
        <Stack direction="row" gap={2} sx={{ alignItems: 'center', color: 'text.secondary', mt: 0.5 }}>
          <Stack direction="row" gap={0.75} sx={{ alignItems: 'center', color: 'text.primary' }}>
             <Heart size={16} color="currentColor" />
             <Typography variant="body2" fontWeight={600} color="inherit">{project.likes}</Typography>
          </Stack>
          <Stack direction="row" gap={0.75} sx={{ alignItems: 'center', color: 'text.primary' }}>
             <Eye size={16} color="currentColor" />
             <Typography variant="body2" fontWeight={600} color="inherit">{project.views}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

export function ProjectGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray('.project-card');
    
    ScrollTrigger.batch(cards, {
      interval: 0.1, // time window to batch items
      batchMax: 3, // maximum items in a batch
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", overwrite: true }),
      onLeave: (batch) => gsap.set(batch, { opacity: 0, y: -30, overwrite: true }),
      onEnterBack: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", overwrite: true }),
      onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 30, overwrite: true }),
      start: "top 85%",
    });
    
    // Initial state
    gsap.set(cards, { opacity: 0, y: 30 });

  }, { scope: gridRef });

  return (
    <Grid container spacing={4} ref={gridRef}>
      {PROJECTS.map((project) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
          <ProjectCard project={project} />
        </Grid>
      ))}
    </Grid>
  );
}
