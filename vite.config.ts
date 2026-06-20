import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// GitHub Pages 部署需要设置 base 路径
// 仓库名是 startup-cemetery，所以 base 是 /startup-cemetery/
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
});
