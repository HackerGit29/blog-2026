import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  DialogProps,
} from '@mui/material';

interface AlertDialogProps extends Omit<DialogProps, 'open' | 'onClose'> {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'success' | 'warning';
}

export function AlertDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Continuer',
  cancelText = 'Annuler',
  confirmColor = 'primary',
  ...dialogProps
}: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: { borderRadius: '16px', maxWidth: 400, p: 1 },
      }}
      {...dialogProps}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
        {title}
      </DialogTitle>
      {description && (
        <DialogContent sx={{ pt: 0 }}>
          <DialogContentText sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {description}
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {cancelText && (
          <Button onClick={onCancel} variant="outlined" color="inherit" sx={{ borderRadius: '30px', px: 3 }}>
            {cancelText}
          </Button>
        )}
        <Button onClick={onConfirm} variant="contained" color={confirmColor} sx={{ borderRadius: '30px', px: 3 }} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
