import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const base = process.env.GITHUB_PAGES ? '/startup-cemetery/' : '/';

export default defineConfig({
  plugins: [react()],
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
    // 兼容旧版 Safari（iOS 14+）
    target: 'es2017',
    chunkSizeWarningLimit: 1500,
  },
});
