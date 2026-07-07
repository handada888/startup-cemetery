import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';
import fs from 'fs';

const base = process.env.GITHUB_PAGES ? '/startup-cemetery/' : '/';

// 构建结束时，把源数据/版本文件复制为 dist/data/ 下的原始文件，
// 这样部署到 gh-pages 后，浏览器端「发布」操作能把最新数据推上线，
// 公共访客也能直接从 data/companies.json 读取已发布数据（无需重新打包）。
function copyRawDataPlugin() {
  return {
    name: 'copy-raw-data',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist/data');
      fs.mkdirSync(outDir, { recursive: true });
      fs.copyFileSync(
        path.resolve(__dirname, 'src/data/companies.json'),
        path.join(outDir, 'companies.json'),
      );
      fs.copyFileSync(
        path.resolve(__dirname, 'src/version.json'),
        path.join(outDir, 'version.json'),
      );
      // eslint-disable-next-line no-console
      console.log('[copy-raw-data] 已输出 dist/data/companies.json 与 dist/data/version.json');
    },
  };
}

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
    copyRawDataPlugin(),
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
