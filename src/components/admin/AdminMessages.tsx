import { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Plus, Send, Trash2, Edit } from 'lucide-react';
import { useAdminMessages, type MessageInput } from '../../hooks/useAdminMessages';

const CTA_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Vidéo' },
  { value: 'external', label: 'Lien externe' },
  { value: 'message', label: 'Message' },
];

export function AdminMessages() {
  const { messages, create, update, remove, send } = useAdminMessages();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MessageInput>({
    title: '',
    body: '',
    cover_url: '',
    cta_label: '',
    cta_url: '',
    cta_target: 'none',
  });

  const handleOpen = (msg?: any) => {
    if (msg) {
      setEditingId(msg.id);
      setForm({
        title: msg.title,
        body: msg.body,
        cover_url: msg.cover_url ?? '',
        cta_label: msg.cta_label ?? '',
        cta_url: msg.cta_url ?? '',
        cta_target: msg.cta_target ?? 'none',
      });
    } else {
      setEditingId(null);
      setForm({ title: '', body: '', cover_url: '', cta_label: '', cta_url: '', cta_target: 'none' });
    }
    setOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      update.mutate({ id: editingId, ...form });
    } else {
      create.mutate(form);
    }
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Messages</Typography>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpen()}>
          Nouveau message
        </Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Titre</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Envoyé le</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((m: any) => (
            <TableRow key={m.id}>
              <TableCell>{m.title}</TableCell>
              <TableCell>{m.status}</TableCell>
              <TableCell>{m.sent_at ? new Date(m.sent_at).toLocaleString('fr-FR') : '—'}</TableCell>
              <TableCell align="right">
                {m.status === 'draft' && (
                  <IconButton size="small" onClick={() => send.mutate(m.id)} title="Envoyer">
                    <Send size={18} />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => handleOpen(m)}>
                  <Edit size={18} />
                </IconButton>
                <IconButton size="small" onClick={() => remove.mutate(m.id)}>
                  <Trash2 size={18} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Modifier le message' : 'Nouveau message'}</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 2, mt: 1 }}>
            <TextField
              label="Titre"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Corps (HTML autorisé)"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              multiline
              rows={8}
              fullWidth
            />
            <TextField
              label="URL de couverture (optionnel)"
              value={form.cover_url}
              onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              fullWidth
            />
            <Stack direction="row" sx={{ gap: 2 }}>
              <TextField
                select
                label="Type de CTA"
                value={form.cta_target}
                onChange={(e) => setForm({ ...form, cta_target: e.target.value as MessageInput['cta_target'] })}
                sx={{ minWidth: 200 }}
              >
                {CTA_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Label du bouton"
                value={form.cta_label}
                onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Stack>
            <TextField
              label="URL du CTA (slug article, ID vidéo, URL externe, etc.)"
              value={form.cta_url}
              onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
