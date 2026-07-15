import React, { useEffect } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useTheme } from '@mui/material';

interface BlockEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function BlockEditor({ content, onChange, placeholder }: BlockEditorProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const editor = useCreateBlockNote({
    domAttributes: { editor: { style: 'min-height: 300px;' } },
    initialContent: undefined,
  });

  useEffect(() => {
    if (content && editor) {
      editor.tryParseHTMLToBlocks(content).then((blocks) => {
        editor.replaceBlocks(editor.document, blocks);
      }).catch(() => {});
    }
  }, []);

  const handleChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    onChange(html);
  };

  return (
    <div style={{
      borderRadius: '16px',
      border: '1px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#1A1A1A',
      overflow: 'hidden',
      background: isDark ? '#1E1E1E' : '#FFFFFF',
    }}>
      <BlockNoteView
        editor={editor}
        theme={isDark ? 'dark' : 'light'}
        onChange={handleChange}
      />
    </div>
  );
}
