import { useState, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton } from '@mui/material';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  bucket?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  currentUrl?: string;
  accept?: string;
  maxSize?: number;
}

export function ImageUpload({ bucket = 'articles', onUpload, onRemove, currentUrl, accept = 'image/*', maxSize = 5 }: Props) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setError('');

    if (file.size > maxSize * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxSize} Mo)`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      onUpload(urlData.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <Upload size={14} />}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
        >
          {uploading ? 'Upload...' : 'Choisir une image'}
        </Button>
        {currentUrl && onRemove && (
          <IconButton size="small" onClick={onRemove} sx={{ color: 'error.main' }}>
            <X size={16} />
          </IconButton>
        )}
        <input ref={fileRef} type="file" accept={accept} hidden onChange={handleFile} />
      </Box>
      {error && <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>{error}</Typography>}
      {currentUrl && (
        <Box
          component="img"
          src={currentUrl}
          sx={{ mt: 1.5, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}
        />
      )}
    </Box>
  );
}
