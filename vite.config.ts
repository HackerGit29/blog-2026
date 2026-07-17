import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const isUI = (id: string) =>
  /@mui|@emotion|@fontsource/.test(id);
const isEditor = (id: string) =>
  /@blocknote|prosemirror|tiptap|@tiptap/.test(id);

export default defineConfig(() => {
  return {
    plugins: [react()],
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (isUI(id)) return 'vendor-ui';
              if (isEditor(id)) return 'vendor-editor';
              return 'vendor';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'formdata-polyfill': path.resolve(__dirname, 'src/empty-polyfill.js'),
        'formdata-polyfill/esm.min.js': path.resolve(__dirname, 'src/empty-polyfill.js')
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
