import { useState } from 'react';
import {
  Avatar,
  Dialog,
  AppBar,
  Toolbar,
  Stack,
  Button,
  Typography,
  Box,
  Divider,
  Slide,
  IconButton,
} from '@mui/material';
import { ArrowLeft, ExternalLink, ArrowRight } from 'lucide-react';
import type { TransitionProps } from '@mui/material/transitions';
import { sanitizeHtml } from '../../lib/sanitize';
import { useMessages } from '../../hooks/useMessages';
import { useMessageReads } from '../../hooks/useMessageReads';
import { MessageItem } from './MessageItem';
import type { Message } from '../../hooks/useMessages';

interface MessageCenterProps {
  open: boolean;
  onClose: () => void;
}

const SlideUp = function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
) {
  return <Slide direction="up" {...props} />;
};

export function MessageCenter({ open, onClose }: MessageCenterProps) {
  const { messages, reads, unreadCount } = useMessages();
  const { markAsRead, markAllAsRead } = useMessageReads();
  const [selected, setSelected] = useState<Message | null>(null);

  const handleClick = (m: Message) => {
    markAsRead.mutate(m.id);
    setSelected(m);
  };

  const handleBack = () => setSelected(null);

  const handleCta = (message: Message) => {
    const { cta_target, cta_url } = message;
    switch (cta_target) {
      case 'article':
      case 'video':
      case 'message':
      case 'none':
      default:
        break;
      case 'external':
        if (cta_url) window.open(cta_url, '_blank', 'noopener,noreferrer');
        break;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slots={{ transition: SlideUp }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'background.default',
            backgroundImage: 'none',
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { sm: '80vh' },
            borderRadius: 0,
            m: { xs: 0, sm: 2 },
          },
        },
      }}
    >
      {selected ? (
        <>
          <AppBar position="sticky" color="default" elevation={0}
            sx={{ bgcolor: 'background.default', backgroundImage: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Toolbar>
              <IconButton edge="start" onClick={handleBack} sx={{ mr: 1 }}>
                <ArrowLeft size={20} />
              </IconButton>
              <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
                {selected.title}
              </Typography>
            </Toolbar>
          </AppBar>
          <Divider />
          <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, p: 3 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Avatar src={selected.author_avatar_url || undefined} sx={{ width: 40, height: 40, fontSize: 16, fontWeight: 700 }}>
                {(selected.author_name || 'A').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selected.author_name || 'Admin'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selected.sent_at ? new Date(selected.sent_at).toLocaleString('fr-FR') : ''}
                </Typography>
              </Box>
            </Stack>
            {selected.cover_url && (
              <Box sx={{ width: '100%', height: 200, borderRadius: 2, backgroundImage: `url(${selected.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center', mb: 2 }} />
            )}
            <Box sx={{ mb: 2 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(selected.body) }} />
            {selected.cta_label && selected.cta_target && selected.cta_target !== 'none' && (
              <Button variant="contained" fullWidth onClick={() => handleCta(selected)}
                endIcon={selected.cta_target === 'external' ? <ExternalLink size={18} /> : <ArrowRight size={18} />}>
                {selected.cta_label}
              </Button>
            )}
          </Box>
        </>
      ) : (
        <>
          <AppBar position="sticky" color="default" elevation={0}
            sx={{ bgcolor: 'background.default', backgroundImage: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
                Messages
              </Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={() => markAllAsRead.mutate()}>
                  Tout marquer comme lu
                </Button>
              )}
            </Toolbar>
          </AppBar>
          <Divider />
          <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {messages.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">Aucun message</Typography>
              </Box>
            ) : (
              <Stack divider={<Divider />}>
                {messages.map((m) => (
                  <MessageItem
                    key={m.id}
                    message={m}
                    isRead={reads.has(m.id)}
                    onClick={() => handleClick(m)}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </>
      )}
    </Dialog>
  );
}
