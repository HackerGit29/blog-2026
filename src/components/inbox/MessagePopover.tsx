import { useState } from 'react';
import { Popover, Box, Stack, Button, Typography, Divider } from '@mui/material';
import { useMessages } from '../../hooks/useMessages';
import { useMessageReads } from '../../hooks/useMessageReads';
import { MessageItem } from './MessageItem';
import { MessageDrawer } from './MessageDrawer';
import type { Message } from '../../hooks/useMessages';

interface MessagePopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function MessagePopover({ anchorEl, onClose }: MessagePopoverProps) {
  const { messages, reads, unreadCount } = useMessages();
  const { markAsRead, markAllAsRead } = useMessageReads();
  const [drawerMessage, setDrawerMessage] = useState<Message | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (m: Message) => {
    markAsRead.mutate(m.id);
    setDrawerMessage(m);
    setDrawerOpen(true);
    onClose();
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 380, maxHeight: 500, mt: 1 } } }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="h6" sx={{ fontSize: 16 }}>Messages</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllAsRead.mutate()}>
              Tout marquer comme lu
            </Button>
          )}
        </Stack>
        <Divider />
        <Box sx={{ overflowY: 'auto', maxHeight: 420 }}>
          {messages.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucun message
              </Typography>
            </Box>
          ) : (
            messages.map((m) => (
              <MessageItem
                key={m.id}
                message={m}
                isRead={reads.has(m.id)}
                onClick={() => handleClick(m)}
              />
            ))
          )}
        </Box>
      </Popover>
      <MessageDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        message={drawerMessage}
      />
    </>
  );
}
