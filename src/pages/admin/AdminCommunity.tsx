import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Mail, Users } from 'lucide-react';

export function AdminCommunity() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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

      <Paper elevation={0} sx={{ p: 3.5, borderRadius: '20px', border: '1px solid', borderColor: 'divider', mb: 4, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        <Mail size={24} />
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>{(subs || []).length}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Abonnés newsletter</Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Liste des abonnés</Typography>
        </Box>
        {(subs || []).length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <Typography variant="body2">Aucun abonné pour le moment</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {(subs || []).map((s: any) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 500 }}>{s.email}</td>
                    <td style={{ padding: '12px 20px', color: 'text.secondary' }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
