import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Stack } from '@mui/material';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useAdminMessages, type MessageInput } from '../../hooks/useAdminMessages';

const CTA_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Vidéo' },
  { value: 'external', label: 'Lien externe' },
  { value: 'message', label: 'Message' },
];

export function AdminMessages() {
  const { messages, create, update, remove } = useAdminMessages();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MessageInput>({
    title: '', body: '', cover_url: '', cta_label: '', cta_url: '', cta_target: 'none',
  });

  const handleOpen = (msg?: any) => {
    if (msg) {
      setEditingId(msg.id);
      setForm({ title: msg.title, body: msg.body, cover_url: msg.cover_url ?? '', cta_label: msg.cta_label ?? '', cta_url: msg.cta_url ?? '', cta_target: msg.cta_target ?? 'none' });
    } else {
      setEditingId(null);
      setForm({ title: '', body: '', cover_url: '', cta_label: '', cta_url: '', cta_target: 'none' });
    }
    setOpen(true);
  };

  const handleSave = () => {
    if (editingId) { update.mutate({ id: editingId, ...form }); }
    else { create.mutate(form); }
    setOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Messages</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{messages.length} message(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpen()}
          sx={{ borderRadius: '30px', textTransform: 'none', fontWeight: 700, px: 3 }}>
          Nouveau message
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Titre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Publié le</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary' }}>Aucun message</TableCell></TableRow>
            ) : messages.map((m: any) => (
              <TableRow key={m.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{m.title}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ color: 'text.secondary' }}>{m.sent_at ? new Date(m.sent_at).toLocaleString('fr-FR') : '—'}</Typography></TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Tooltip title="Modifier"><IconButton size="small" onClick={() => handleOpen(m)}><Edit size={16} /></IconButton></Tooltip>
                  <Tooltip title="Supprimer"><IconButton size="small" onClick={() => remove.mutate(m.id)}><Trash2 size={16} /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? 'Modifier le message' : 'Nouveau message'}</DialogTitle>
        <DialogContent dividers>
          <Stack sx={{ gap: 2, mt: 1 }}>
            <TextField label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth required />
            <TextField label="Corps (HTML autorisé)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} multiline rows={8} fullWidth />
            <TextField label="URL de couverture (optionnel)" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} fullWidth />
            <Stack direction="row" sx={{ gap: 2 }}>
              <TextField select label="Type de CTA" value={form.cta_target} onChange={(e) => setForm({ ...form, cta_target: e.target.value as MessageInput['cta_target'] })} sx={{ minWidth: 200 }}>
                {CTA_OPTIONS.map((o) => (<MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>))}
              </TextField>
              <TextField label="Label du bouton" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} sx={{ flex: 1 }} />
            </Stack>
            <TextField label="URL du CTA (slug article, ID vidéo, URL externe, etc.)" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: '30px', textTransform: 'none', fontWeight: 600 }}>Annuler</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: '30px', textTransform: 'none', fontWeight: 600 }}>Publier</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
