import { Drawer, Box, Typography, Button, IconButton, Stack, Divider } from '@mui/material';
import { sanitizeHtml } from '../../lib/sanitize';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Message } from '../../hooks/useMessages';

interface MessageDrawerProps {
  open: boolean;
  onClose: () => void;
  message: Message | null;
}

export function MessageDrawer({ open, onClose, message }: MessageDrawerProps) {
  const navigate = useNavigate();
  const { user } = useParams<{ user: string }>();
  const base = `/${user ?? 'admin'}`;
  if (!message) return null;

  const handleCta = () => {
    switch (message.cta_target) {
      case 'article':
        navigate(message.cta_url ?? `${base}/blog`);
        break;
      case 'video':
        navigate(message.cta_url ?? `${base}/videos`);
        break;
      case 'external':
        if (message.cta_url) window.open(message.cta_url, '_blank', 'noopener,noreferrer');
        break;
      case 'message':
      case 'none':
      default:
        break;
    }
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 480 } } } }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">{message.title}</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {message.cover_url && (
          <Box
            sx={{
              width: '100%',
              height: 200,
              borderRadius: 2,
              backgroundImage: `url(${message.cover_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mb: 2,
            }}
          />
        )}
        <Box
          sx={{ flex: 1, overflowY: 'auto', mb: 2 }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.body) }}
        />
        {message.cta_label && message.cta_target && message.cta_target !== 'none' && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleCta}
            endIcon={message.cta_target === 'external' ? <ExternalLink size={18} /> : <ArrowRight size={18} />}
            sx={{ mt: 'auto' }}
          >
            {message.cta_label}
          </Button>
        )}
      </Box>
    </Drawer>
  );
}
