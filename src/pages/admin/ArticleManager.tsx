import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl, IconButton, Tooltip, Tab } from '@mui/material';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import { usePortfolioStore } from '../../store/portfolio';
import { BlockEditor } from '../../components/admin/BlockEditor';
import { ImageUpload } from '../../components/admin/ImageUpload';
import DOMPurify from 'dompurify';

interface ArticleForm {
  title: string; slug: string; content: string; summary: string;
  image_url: string; video_url: string; media_type: string;
  category_id: string; meta_description: string; tags: string;
  status: string; published_at: string; reading_time: number;
}

const EMPTY_FORM: ArticleForm = {
  title: '', slug: '', content: '', summary: '', image_url: '',
  video_url: '', media_type: 'image', category_id: '', meta_description: '',
  tags: '', status: 'draft', published_at: '', reading_time: 5,
};

const statusColors: Record<string, string> = { draft: '#F59E0B', scheduled: '#3B82F6', published: '#22C55E', archived: '#6B7280' };

export function ArticleManager() {
  const { user } = useAuth();
  const profile = usePortfolioStore(s => s.profile);
  const tenant = profile.username || 'admin';
  const base = `/${tenant}`;
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_categories').select('*').order('name');
      return (data || []) as any[];
    },
  });

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('admin_articles')
        .select('*, blog_categories(name)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      return (data || []) as any[];
    },
    enabled: !!user,
  });

  const filtered: any[] = (articles || []).filter((a: any) => {
    const ms = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const fs = filterStatus === 'all' || a.status === filterStatus;
    return ms && fs;
  });

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || autoSlug(form.title);
      const payload: any = {
        title: form.title, slug, content: form.content, summary: form.summary,
        image_url: form.image_url || null, video_url: form.video_url || null,
        media_type: form.media_type, category_id: form.category_id || null,
        meta_description: form.meta_description || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: form.status, reading_time: form.reading_time,
        is_published: form.status === 'published',
        published_at: form.status === 'published' ? (form.published_at || new Date().toISOString()) : null,
        author_id: user!.id,
      };
      if (editingId) {
        const { error } = await (supabase.from('admin_articles') as any).update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('admin_articles').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-articles'] }); closeDialog(); },
    onError: (e: any) => alert(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-articles'] }); setDeleteTarget(null); },
    onError: () => alert('Erreur'),
  });

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setForm({
      title: a.title, slug: a.slug || '', content: a.content || '', summary: a.summary || '',
      image_url: a.image_url || '', video_url: a.video_url || '', media_type: a.media_type || 'image',
      category_id: a.category_id || '', meta_description: a.meta_description || '',
      tags: (a.tags || []).join(', '), status: a.status,
      published_at: a.published_at ? new Date(a.published_at).toISOString().slice(0, 16) : '',
      reading_time: a.reading_time || 5,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditingId(null); setForm(EMPTY_FORM); };

  const openPreview = (a: any) => { setPreviewArticle(a); setPreviewOpen(true); };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Articles</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{filtered.length} article(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setDialogOpen(true); }}
          sx={{ borderRadius: '30px', textTransform: 'none', fontWeight: 700, px: 3 }}>
          Nouvel article
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <Search size={16} style={{ marginRight: 8 }} /> } }}
          sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: '30px' } }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['all', 'draft', 'scheduled', 'published', 'archived'].map(s => (
            <Chip key={s} label={s === 'all' ? 'Tous' : s} onClick={() => setFilterStatus(s)}
              color={filterStatus === s ? 'primary' : 'default'} variant={filterStatus === s ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
          ))}
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Titre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Catégorie</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>Aucun article trouvé</TableCell></TableRow>
            ) : filtered.map((a: any) => (
              <TableRow key={a.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {a.image_url && <Box component="img" src={a.image_url} sx={{ width: 40, height: 28, borderRadius: '6px', objectFit: 'cover' }} />}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{base}/blog/{a.slug}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2" sx={{ color: 'text.secondary' }}>{a.blog_categories?.name || '—'}</Typography></TableCell>
                <TableCell><Chip label={a.status} size="small" sx={{ fontWeight: 600, bgcolor: statusColors[a.status] + '20', color: statusColors[a.status], textTransform: 'capitalize' }} /></TableCell>
                <TableCell><Typography variant="body2" sx={{ color: 'text.secondary' }}>{a.media_type === 'video' ? 'Vidéo' : 'Article'}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ color: 'text.secondary' }}>{a.published_at ? new Date(a.published_at).toLocaleDateString('fr-FR') : new Date(a.created_at).toLocaleDateString('fr-FR')}</Typography></TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Tooltip title="Aperçu"><IconButton size="small" onClick={() => openPreview(a)}><Eye size={16} /></IconButton></Tooltip>
                  <Tooltip title="Modifier"><IconButton size="small" onClick={() => openEdit(a)}><Pencil size={16} /></IconButton></Tooltip>
                  <Tooltip title="Supprimer"><IconButton size="small" onClick={() => setDeleteTarget(a.id)}><Trash2 size={16} /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Editor Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="lg" fullWidth scroll="body">
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{editingId ? "Modifier l'article" : 'Nouvel article'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField label="Titre" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: autoSlug(e.target.value) }))} required sx={{ flex: 2, minWidth: 250 }} />
              <TextField label="Slug" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} sx={{ flex: 1, minWidth: 200 }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>Image à la une</Typography>
                <ImageUpload currentUrl={form.image_url} onUpload={url => setForm(p => ({ ...p, image_url: url }))} onRemove={() => setForm(p => ({ ...p, image_url: '' }))} />
              </Box>
              <TextField label="Video URL" value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://youtube.com/..." sx={{ flex: 1, minWidth: 200 }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>Contenu</Typography>
              <BlockEditor content={form.content} onChange={html => setForm(p => ({ ...p, content: html }))} />
            </Box>
            <TextField label="Résumé" value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} multiline rows={2} fullWidth />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Statut</InputLabel>
                <Select value={form.status} label="Statut" onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <MenuItem value="draft">Brouillon</MenuItem>
                  <MenuItem value="scheduled">Planifié</MenuItem>
                  <MenuItem value="published">Publié</MenuItem>
                  <MenuItem value="archived">Archivé</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Catégorie</InputLabel>
                <Select value={form.category_id} label="Catégorie" onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                  {categories?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Type média</InputLabel>
                <Select value={form.media_type} label="Type média" onChange={e => setForm(p => ({ ...p, media_type: e.target.value }))}>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="video">Vidéo</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Temps (min)" type="number" value={form.reading_time} onChange={e => setForm(p => ({ ...p, reading_time: parseInt(e.target.value) || 5 }))} sx={{ width: 120 }} />
            </Box>
            <TextField label="Tags (séparés par virgules)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="react, ai, cloud" fullWidth />
            <TextField label="Meta Description (SEO)" value={form.meta_description} onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))} multiline rows={2} fullWidth />
            {(form.status === 'scheduled' || form.status === 'published') && (
              <TextField label="Date de publication" type="datetime-local" value={form.published_at} onChange={e => setForm(p => ({ ...p, published_at: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={closeDialog}>Annuler</Button>
          <Button onClick={() => saveMutation.mutate()} variant="contained" disabled={!form.title || saveMutation.isPending} sx={{ borderRadius: '30px', textTransform: 'none', fontWeight: 700 }}>
            {saveMutation.isPending ? 'Sauvegarde...' : editingId ? 'Mettre à jour' : 'Publier'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth scroll="body">
        <DialogTitle sx={{ fontWeight: 700 }}>{previewArticle?.title}</DialogTitle>
        <DialogContent dividers>
          {previewArticle?.image_url && (
            <Box component="img" src={previewArticle.image_url} sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: '12px', mb: 3 }} />
          )}
          {previewArticle?.summary && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, fontStyle: 'italic' }}>{previewArticle.summary}</Typography>
          )}
          <Box sx={{ '& img': { maxWidth: '100%', borderRadius: '8px' }, '& h2': { mt: 4, mb: 2 }, '& h3': { mt: 3, mb: 1.5 }, '& p': { mb: 2, lineHeight: 1.8 } }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewArticle?.content || '') }} />
        </DialogContent>
        <DialogActions><Button onClick={() => setPreviewOpen(false)}>Fermer</Button></DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Supprimer cet article ?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>Cette action est irréversible.</Typography></DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)} sx={{ borderRadius: '30px', textTransform: 'none', fontWeight: 700 }}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
