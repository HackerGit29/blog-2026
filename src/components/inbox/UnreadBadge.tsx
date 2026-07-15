import { Box } from '@mui/material';

interface UnreadBadgeProps {
  count: number;
  size?: number;
}

export function UnreadBadge({ count, size = 10 }: UnreadBadgeProps) {
  if (count <= 0) return null;
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 4,
        right: 6,
        minWidth: size + 6,
        height: size + 6,
        bgcolor: '#FF5A1F',
        borderRadius: '50%',
        border: '2px solid',
        borderColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        fontWeight: 700,
        color: '#FFF',
        px: 0.5,
      }}
    >
      {count > 99 ? '99+' : count}
    </Box>
  );
}
