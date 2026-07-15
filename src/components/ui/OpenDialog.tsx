import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogProps,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface OpenDialogProps extends Omit<DialogProps, 'open' | 'onClose'> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function OpenDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'sm',
  ...dialogProps
}: OpenDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', p: 0 },
      }}
      {...dialogProps}
    >
      {title && (
        <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: 3, pt: 3, pb: description ? 0 : 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
                {description}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ ml: 2, mt: 0.5 }}>
            <CloseIcon size={18} />
          </IconButton>
        </DialogTitle>
      )}

      {children && (
        <DialogContent sx={{ px: 3, py: title ? 2 : 3 }}>
          {children}
        </DialogContent>
      )}

      {footer && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 3, pb: 3 }}>
          {footer}
        </Box>
      )}
    </Dialog>
  );
}
