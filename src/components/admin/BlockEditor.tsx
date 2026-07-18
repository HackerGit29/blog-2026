import { useEffect, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useTheme, Box, IconButton, Tooltip } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import DOMPurify from 'dompurify';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function BlockEditor({ content, onChange, placeholder }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [preview, setPreview] = useState(false);

  const editor = useCreateBlockNote({
    domAttributes: { editor: { style: 'min-height: 300px;' } },
    initialContent: undefined,
  });

  useEffect(() => {
    if (content && editor) {
      try {
        const blocks = editor.tryParseHTMLToBlocks(content);
        editor.replaceBlocks(editor.document, blocks);
      } catch {}
    }
  }, []);

  const handleChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    onChange(html);
  };

  return (
    <Box sx={{
      borderRadius: '12px',
      border: '1px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'divider',
      overflow: 'hidden',
      bgcolor: isDark ? '#1E1E1E' : '#FFFFFF',
    }}>
      <Box sx={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        px: 2, py: 0.5, borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Tooltip title={preview ? 'Éditer' : 'Aperçu'}>
          <IconButton size="small" onClick={() => setPreview(!preview)}>
            {preview ? <EyeOff size={16} /> : <Eye size={16} />}
          </IconButton>
        </Tooltip>
      </Box>
      {preview ? (
        <Box
          sx={{ p: 3, minHeight: 300, '& img': { maxWidth: '100%', borderRadius: '8px' } }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
      ) : (
        <BlockNoteView
          editor={editor}
          theme={isDark ? 'dark' : 'light'}
          onChange={handleChange}
        />
      )}
    </Box>
  );
}
