import { useState } from 'react';
import { Box, Stack, Typography, Button, TextField, MenuItem, Alert } from '@mui/material';
import { Send } from 'lucide-react';
import { useAdminNotifications, type NotificationBroadcast } from '../../hooks/useAdminNotifications';

const KIND_OPTIONS = [
  { value: 'announcement', label: 'Annonce' },
  { value: 'event', label: 'Événement' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Vidéo' },
  { value: 'message', label: 'Message' },
  { value: 'system', label: 'Système' },
];

const CTA_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Vidéo' },
  { value: 'external', label: 'Lien externe' },
  { value: 'message', label: 'Message' },
];

export function AdminNotifications() {
  const { broadcast } = useAdminNotifications();
  const [form, setForm] = useState<NotificationBroadcast>({
    kind: 'announcement',
    title: '',
    body: '',
    cta_label: '',
    cta_url: '',
    cta_target: 'none',
    user_id: undefined,
  });
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSend = async () => {
    try {
      await broadcast.mutateAsync(form);
      setFeedback({ ok: true, msg: 'Notification(s) envoyée(s)' });
      setForm({
        kind: 'announcement',
        title: '',
        body: '',
        cta_label: '',
        cta_url: '',
        cta_target: 'none',
        user_id: undefined,
      });
    } catch (e: any) {
      setFeedback({ ok: false, msg: e?.message ?? "Erreur lors de l'envoi" });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 720 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Notifications</Typography>

      {feedback && (
        <Alert severity={feedback.ok ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
          {feedback.msg}
        </Alert>
      )}

      <Stack sx={{ gap: 2 }}>
        <TextField
          select
          label="Type"
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: e.target.value as NotificationBroadcast['kind'] })}
        >
          {KIND_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Titre"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <TextField
          label="Corps (optionnel)"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          multiline
          rows={4}
        />
        <Stack direction="row" sx={{ gap: 2 }}>
          <TextField
            select
            label="Type de CTA"
            value={form.cta_target}
            onChange={(e) => setForm({ ...form, cta_target: e.target.value as NotificationBroadcast['cta_target'] })}
            sx={{ minWidth: 200 }}
          >
            {CTA_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Label"
            value={form.cta_label}
            onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
            sx={{ flex: 1 }}
          />
        </Stack>
        <TextField
          label="URL du CTA"
          value={form.cta_url}
          onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
          helperText="Slug article, ID vidéo, URL externe, etc."
        />
        <TextField
          label="User ID ciblé (vide = broadcast à tous)"
          value={form.user_id ?? ''}
          onChange={(e) => setForm({ ...form, user_id: e.target.value || undefined })}
        />
        <Button
          variant="contained"
          startIcon={<Send size={18} />}
          onClick={handleSend}
          disabled={!form.title || broadcast.isPending}
          sx={{ alignSelf: 'flex-start' }}
        >
          {form.user_id ? "Envoyer à l'utilisateur" : 'Envoyer à tous'}
        </Button>
      </Stack>
    </Box>
  );
}
