import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@tps/shared': path.resolve(__dirname, '../../packages/shared/src'),
      },
    },
    optimizeDeps: {
      // Exclude pdfjs-dist from pre-bundling so its worker resolves correctly
      exclude: ['pdfjs-dist'],
    },
    server: {
      port: 3002,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: apiBase.replace(/\/api$/, ''),
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            pdfjs: ['pdfjs-dist'],
          },
        },
      },
    },
  };
});
