import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react()], build: { sourcemap: true },
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
