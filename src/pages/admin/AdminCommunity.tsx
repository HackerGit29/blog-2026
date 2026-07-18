import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Mail, Users, Calendar } from 'lucide-react';

export function AdminCommunity() {
  const { data: subs } = useQuery({
    queryKey: ['admin-newsletter'],
    queryFn: async () => {
      const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
      return (data || []) as any[];
    },
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Community</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>Abonnés newsletter et engagement</Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', mb: 4, display: 'inline-flex', alignItems: 'center', gap: 2.5 }}>
        <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(0,0,0,0.03)', color: '#6366F1', display: 'flex' }}><Mail size={22} /></Box>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>{(subs || []).length}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Abonné(s) newsletter</Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Liste des abonnés</Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date d'inscription</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(subs || []).length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary' }}><Users size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} /><Typography>Aucun abonné pour le moment</Typography></TableCell></TableRow>
            ) : (subs || []).map((s: any) => (
              <TableRow key={s.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{s.email}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Calendar size={14} />{new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Typography>
                </TableCell>
                <TableCell><Chip label={s.status || 'active'} size="small" color={s.status === 'active' ? 'success' : 'default'} sx={{ fontWeight: 600, textTransform: 'capitalize' }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
