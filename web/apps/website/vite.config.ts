import { fileURLToPath, URL } from 'node:url';
import babel from '@rolldown/plugin-babel';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { websitePictureHeadPlugin } from './vite/website-picture-head-plugin';

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routeFileIgnorePattern: '\\.test\\.',
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    websitePictureHeadPlugin(),
  ],
  build: {
    rolldownOptions: {
      output: { strictExecutionOrder: true },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
    },
  },
});
