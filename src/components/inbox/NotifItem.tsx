import { Box, Stack, Typography } from '@mui/material';
import { Bell, Megaphone, Calendar, FileText, Video, Mail, Info } from 'lucide-react';
import type { Notification } from '../../hooks/useNotifications';

const ICON_MAP = {
  announcement: Megaphone,
  event: Calendar,
  article: FileText,
  video: Video,
  message: Mail,
  system: Info,
} as const;

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d}j`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

interface NotifItemProps {
  notification: Notification;
  isRead: boolean;
  onClick: () => void;
}

export function NotifItem({ notification, isRead, onClick }: NotifItemProps) {
  const Icon = ICON_MAP[notification.kind] ?? Bell;
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        position: 'relative',
        bgcolor: isRead ? 'transparent' : 'action.hover',
        borderLeft: '3px solid',
        borderColor: isRead ? 'transparent' : 'primary.main',
        '&:hover': { bgcolor: 'action.selected' },
      }}
    >
      <Box sx={{ color: 'primary.main', mt: 0.25 }}>
        <Icon size={18} />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: isRead ? 400 : 600 }} noWrap>
          {notification.title}
        </Typography>
        {notification.body && (
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
            {notification.body}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {timeAgo(notification.created_at)}
        </Typography>
      </Stack>
    </Box>
  );
}
