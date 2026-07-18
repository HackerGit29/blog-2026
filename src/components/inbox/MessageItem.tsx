import { Avatar, Box, Stack, Typography } from '@mui/material';
import type { Message } from '../../hooks/useMessages';

interface MessageItemProps {
  message: Message;
  isRead: boolean;
  onClick: () => void;
}

export function MessageItem({ message, isRead, onClick }: MessageItemProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        bgcolor: isRead ? 'transparent' : 'action.hover',
        borderLeft: '3px solid',
        borderColor: isRead ? 'transparent' : 'primary.main',
        '&:hover': { bgcolor: 'action.selected' },
      }}
    >
      <Avatar
        src={message.author_avatar_url || undefined}
        sx={{ width: 44, height: 44, flexShrink: 0, fontSize: 18, fontWeight: 700 }}
      >
        {(message.author_name || 'A').charAt(0).toUpperCase()}
      </Avatar>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.2 }}>
          {message.author_name || 'Admin'}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: isRead ? 400 : 600 }} noWrap>
          {message.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {message.body.replace(/<[^>]*>/g, '').slice(0, 100)}
        </Typography>
      </Stack>
    </Box>
  );
}
