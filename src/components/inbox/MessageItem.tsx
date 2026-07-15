import { Box, Stack, Typography } from '@mui/material';
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
      <Box
        sx={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 2,
          backgroundImage: message.cover_url ? `url(${message.cover_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          bgcolor: 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!message.cover_url && (
          <Typography variant="h5" sx={{ color: 'text.secondary' }}>
            {message.title.charAt(0).toUpperCase()}
          </Typography>
        )}
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: isRead ? 400 : 600 }} noWrap>
          {message.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {message.body.replace(/<[^>]*>/g, '').slice(0, 120)}
        </Typography>
      </Stack>
    </Box>
  );
}
