import React, { useRef, useState } from 'react';
import { Box, Typography, Card, IconButton, Slider, Stack, Button, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ErrorIcon from '@mui/icons-material/Error';
import { getEmbedUrl } from '../../../lib/videoUtils';

export interface TutorialVideoPlayerProps {
  videoUrl?: string;
  poster?: string;
  title?: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export function getVideoSourceType(url?: string): 'direct' | 'youtube' | 'vimeo' | 'unknown' {
  if (!url) return 'unknown';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return 'direct';
  // If it's a direct storage URL (like Supabase, drive proxy, CDN), default to direct video player
  return 'direct';
}

export function TutorialVideoPlayer({ videoUrl, poster, title, onTimeUpdate }: TutorialVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const sourceType = getVideoSourceType(videoUrl);

  if (!videoUrl || sourceType === 'unknown') {
    return (
      <Box 
        sx={{ 
          position: 'relative', 
          paddingTop: '56.25%', 
          bgcolor: 'grey.950', 
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 3,
            color: 'grey.500'
          }}
        >
          <ErrorIcon sx={{ fontSize: 48, mb: 2, color: 'text.disabled' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'grey.300' }}>
            Vidéo indisponible
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Le lien de ce tutoriel vidéo n'est pas encore disponible ou est invalide.
          </Typography>
        </Box>
      </Box>
    );
  }

  // Handle HTML5 Direct Video
  if (sourceType === 'direct') {
    const handlePlayPause = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleMuteToggle = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current) {
        const current = videoRef.current.currentTime;
        const dur = videoRef.current.duration || 0;
        setCurrentTime(current);
        setDuration(dur);
        setProgress(dur > 0 ? (current / dur) * 100 : 0);
        if (onTimeUpdate) {
          onTimeUpdate(current);
        }
      }
    };

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
      if (videoRef.current && typeof newValue === 'number') {
        const newTime = (newValue / 100) * duration;
        videoRef.current.currentTime = newTime;
        setProgress(newValue);
      }
    };

    const handleFullscreen = () => {
      if (videoRef.current) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      }
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
      <Card 
        sx={{ 
          position: 'relative', 
          bgcolor: 'black', 
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover .video-controls-overlay': { opacity: 1 }
        }}
      >
        <Box sx={{ position: 'relative', paddingTop: '56.25%', cursor: 'pointer' }} onClick={handlePlayPause}>
          <video
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
            controlsList="nodownload"
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              backgroundColor: '#000'
            }}
          />
        </Box>

        {/* Custom Premium Controls Overlay */}
        <Box 
          className="video-controls-overlay"
          sx={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            pointerEvents: 'auto',
            color: 'white',
            zIndex: 10
          }}
        >
          {/* Progress Slider */}
          <Slider
            size="small"
            value={progress}
            onChange={handleSliderChange}
            sx={{
              color: 'primary.main',
              height: 4,
              p: 0,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                transition: '0.3s ease-in-out',
                '&::before': { boxShadow: 'none' },
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 8px rgba(var(--mui-palette-primary-mainChannel), 0.16)',
                },
              },
              '& .MuiSlider-rail': { opacity: 0.28 },
            }}
          />

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <IconButton size="small" onClick={handlePlayPause} sx={{ color: 'white' }}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton size="small" onClick={handleMuteToggle} sx={{ color: 'white' }}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono, monospace', color: 'grey.300' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Tooltip title="Plein écran">
                <IconButton size="small" onClick={handleFullscreen} sx={{ color: 'white' }}>
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Card>
    );
  }

  // Fallback to iframe for YouTube or Vimeo
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <Card 
      sx={{ 
        position: 'relative', 
        paddingTop: '56.25%', 
        bgcolor: 'grey.950', 
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <iframe 
        src={embedUrl} 
        title={title || "Tutoriel Vidéo"}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          border: 0 
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Card>
  );
}
