import { useState } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  Stack,
  Button,
  Typography,
  Box,
  Divider,
  Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { useMessages } from '../../hooks/useMessages';
import { useMessageReads } from '../../hooks/useMessageReads';
import { MessageItem } from './MessageItem';
import { MessageDrawer } from './MessageDrawer';
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
  const [drawerMessage, setDrawerMessage] = useState<Message | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClick = (m: Message) => {
    markAsRead.mutate(m.id);
    setDrawerMessage(m);
    setDrawerOpen(true);
  };

  return (
    <>
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
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{
            bgcolor: 'background.default',
            backgroundImage: 'none',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
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
              <Typography variant="body1" color="text.secondary">
                Aucun message
              </Typography>
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
      </Dialog>

      <MessageDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        message={drawerMessage}
      />
    </>
  );
}
