import { Avatar, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';
import { optimizedAvatar } from '../../lib/optimizedUrl';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface AuthorMeta {
  name: string;
  avatar: string;
  username: string;
}

export function getAuthorMeta(article: any): AuthorMeta | null {
  const a = article?.author;
  if (!a?.name && !a?.username) return null;
  return {
    name: a.name || a.username || '',
    avatar: a.avatar_url || '',
    username: a.username || '',
  };
}

interface Props {
  article: any;
  /** Show username in subtitle below name */
  showUsername?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Additional suffix after date */
  suffix?: string | ReactNode;
}

export function ArticleAuthorFooter({ article, showUsername, size = 'small', suffix }: Props) {
  const meta = getAuthorMeta(article);
  if (!meta) return null;

  const avatarSize = size === 'medium' ? 36 : 28;
  const dateStr = formatDate(article.published_at);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Avatar
        src={optimizedAvatar(meta.avatar, avatarSize * 2) || undefined}
        alt={meta.name}
        slotProps={{ img: { loading: 'lazy' } }}
        sx={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.5, bgcolor: 'primary.main' }}
      >
        {meta.name.charAt(0)}
      </Avatar>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {meta.name}
        </Typography>
        {dateStr && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {dateStr}
          </Typography>
        )}
      </Box>
      {suffix && (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, ml: 'auto' }}>
          {suffix}
        </Typography>
      )}
    </Box>
  );
}
