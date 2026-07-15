import { useState, useMemo } from 'react';
import { Popover, Box, Tabs, Tab, Stack, Button, Typography, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useNotificationReads } from '../../hooks/useNotificationReads';
import { NotifItem } from './NotifItem';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

type FilterTab = 'all' | 'unread' | 'announcement' | 'event';

export function NotificationPopover({ anchorEl, onClose }: NotificationPopoverProps) {
  const [tab, setTab] = useState<FilterTab>('all');
  const { notifications, reads, unreadCount } = useNotifications();
  const { markAsRead, markAllAsRead } = useNotificationReads();
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

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
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 380, maxHeight: 480, mt: 1 } } }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <Typography variant="h6" sx={{ fontSize: 16 }}>Notifications</Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={() => markAllAsRead.mutate()}>
            Tout marquer comme lu
          </Button>
        )}
      </Stack>
      <Divider />
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{ minHeight: 36, px: 1 }}
      >
        <Tab label="Tout" value="all" sx={{ minHeight: 36, py: 0 }} />
        <Tab label={`Non lus (${unreadCount})`} value="unread" sx={{ minHeight: 36, py: 0 }} />
        <Tab label="Annonces" value="announcement" sx={{ minHeight: 36, py: 0 }} />
        <Tab label="Événements" value="event" sx={{ minHeight: 36, py: 0 }} />
      </Tabs>
      <Divider />
      <Box sx={{ overflowY: 'auto', maxHeight: 360 }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune notification
            </Typography>
          </Box>
        ) : (
          filtered.map((n) => (
            <NotifItem
              key={n.id}
              notification={n}
              isRead={reads.has(n.id)}
              onClick={() => handleClick(n)}
            />
          ))
        )}
      </Box>
    </Popover>
  );
}
