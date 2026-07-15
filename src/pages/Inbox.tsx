import { Box, Typography, Stack } from '@mui/material';
import { useMessages } from '../hooks/useMessages';
import { MessageItem } from '../components/inbox/MessageItem';
import { useState } from 'react';
import { MessageDrawer } from '../components/inbox/MessageDrawer';
import { useMessageReads } from '../hooks/useMessageReads';
import type { Message } from '../hooks/useMessages';

export function Inbox() {
  const { messages, reads } = useMessages();
  const { markAsRead } = useMessageReads();
  const [drawerMessage, setDrawerMessage] = useState<Message | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 3 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>Boîte de réception</Typography>
      {messages.length === 0 ? (
        <Typography color="text.secondary">Aucun message pour le moment.</Typography>
      ) : (
        <Stack sx={{ gap: 1 }}>
          {messages.map((m) => (
            <Box
              key={m.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <MessageItem
                message={m}
                isRead={reads.has(m.id)}
                onClick={() => {
                  markAsRead.mutate(m.id);
                  setDrawerMessage(m);
                  setDrawerOpen(true);
                }}
              />
            </Box>
          ))}
        </Stack>
      )}
      <MessageDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        message={drawerMessage}
      />
    </Box>
  );
}
