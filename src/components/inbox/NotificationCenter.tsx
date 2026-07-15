import { useState, useMemo } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Stack,
  Button,
  Typography,
  Box,
  Divider,
  Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useNotificationReads } from '../../hooks/useNotificationReads';
import { NotifItem } from './NotifItem';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

type FilterTab = 'all' | 'unread' | 'announcement' | 'event';

const SlideUp = function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
) {
  return <Slide direction="up" {...props} />;
};

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [tab, setTab] = useState<FilterTab>('all');
  const { notifications, reads, unreadCount } = useNotifications();
  const { markAsRead, markAllAsRead } = useNotificationReads();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (tab === 'unread') return notifications.filter((n) => !reads.has(n.id));
    if (tab === 'announcement') return notifications.filter((n) => n.kind === 'announcement');
    if (tab === 'event') return notifications.filter((n) => n.kind === 'event');
    return notifications;
  }, [notifications, reads, tab]);

  const handleClick = (n: (typeof notifications)[number]) => {
    markAsRead.mutate(n.id);
    switch (n.cta_target) {
      case 'article':
        navigate(`/blog/${n.metadata?.slug ?? ''}`);
        break;
      case 'video':
        navigate(`/blog/videos#${n.metadata?.video_id ?? ''}`);
        break;
      case 'external':
        if (n.cta_url) window.open(n.cta_url, '_blank', 'noopener,noreferrer');
        break;
      case 'message':
        navigate(`/inbox?message=${n.metadata?.message_id ?? ''}`);
        break;
      case 'none':
      default:
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
            borderRadius: { xs: 0, sm: 3 },
            m: { xs: 0, sm: 2 },
          },
        },
      }}
    >
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ bgcolor: 'background.default', backgroundImage: 'none', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllAsRead.mutate()}>
              Tout marquer comme lu
            </Button>
          )}
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <X size={20} />
          </IconButton>
        </Toolbar>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons={false}
          sx={{ minHeight: 42, px: 1, bgcolor: 'background.default' }}
        >
          <Tab label="Tout" value="all" sx={{ minHeight: 42, py: 0 }} />
          <Tab label={`Non lus (${unreadCount})`} value="unread" sx={{ minHeight: 42, py: 0 }} />
          <Tab label="Annonces" value="announcement" sx={{ minHeight: 42, py: 0 }} />
          <Tab label="Événements" value="event" sx={{ minHeight: 42, py: 0 }} />
        </Tabs>
      </AppBar>

      <Divider />

      <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Aucune notification
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.map((n) => (
              <NotifItem
                key={n.id}
                notification={n}
                isRead={reads.has(n.id)}
                onClick={() => handleClick(n)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Dialog>
  );
}
