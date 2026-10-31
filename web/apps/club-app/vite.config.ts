import { fileURLToPath, URL } from 'node:url';
import babel from '@rolldown/plugin-babel';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const SCREEN_BACKGROUND = '#F1F2F4';
const PRECACHE_FILE_LIMIT_BYTES = 6 * 1024 * 1024;

export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routeFileIgnorePattern: '\\.test\\.',
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      disable: mode === 'native',
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'FURRIA Club',
        short_name: 'FURRIA',
        description: 'Der Mitgliederbereich des FCC.',
        lang: 'de',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: SCREEN_BACKGROUND,
        theme_color: SCREEN_BACKGROUND,
        categories: ['social', 'lifestyle'],
        prefer_related_applications: false,
        related_applications: [{ platform: 'webapp', url: '/manifest.webmanifest' }],
        icons: [
          { src: '/app-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/app-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/app-icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          { name: 'Kalender', url: '/calendar' },
          { name: 'Neuigkeiten', url: '/news' },
          { name: 'Galerie', url: '/gallery' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,mjs,css,html,svg,png,woff2}'],
        globIgnores: ['config.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/\.well-known\//],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: PRECACHE_FILE_LIMIT_BYTES,
      },
    }),
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
    warmup: {
      clientFiles: ['./index.html', './src/**/*.{ts,tsx}', '!./src/**/*.test.{ts,tsx}'],
    },
    port: 3001,
    strictPort: true,
    watch: {
      ignored: ['**/android/**', '**/ios/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      },
    },
  },
}));
