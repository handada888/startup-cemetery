import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';

const base = process.env.GITHUB_PAGES ? '/startup-cemetery/' : '/';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // 兼容 iOS Safari 13+
      targets: ['iOS >= 13', 'Safari >= 13', 'Chrome >= 60'],
      // 生成兼容版本的 JS
      renderLegacyChunks: true,
      // 额外的 polyfill
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  build: {
    target: 'es2015',
    chunkSizeWarningLimit: 2000,
  },
});
