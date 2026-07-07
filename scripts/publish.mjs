// 发布脚本：版本确认门禁
// 用法：
//   node scripts/publish.mjs            # 仅预览待发布版本，不发布
//   node scripts/publish.mjs --confirm  # 确认后构建并发布到线上 (gh-pages) + 打 git tag
//
// 设计原则：每次更新先进入“待发布”状态，必须显式带 --confirm 才会真正推送线上。
// 即使是自动化执行，缺少 --confirm 也只会预览，不会触达生产环境。

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const versionPath = path.join(root, 'src', 'version.json');

const args = process.argv.slice(2);
const confirmed = args.includes('--confirm');

const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
const { version, changelog = [] } = versionData;
const pending = changelog.find(c => c.version === version) || {};

console.log('\n========================================');
console.log(`  待发布版本: v${version}`);
console.log('========================================');
if (pending.title) console.log(`  标题: ${pending.title}`);
if (pending.date) console.log(`  日期: ${pending.date}`);
if (pending.changes?.length) {
  console.log('  变更内容:');
  pending.changes.forEach(c => console.log(`    • ${c}`));
}
console.log('========================================\n');

if (!confirmed) {
  console.log('🚫 未带 --confirm，已中止发布（仅预览）。');
  console.log('   确认无误后运行: node scripts/publish.mjs --confirm\n');
  process.exit(0);
}

console.log('🔨 开始构建...');
execSync('NODE_OPTIONS="" GITHUB_PAGES=true npx vite build', {
  cwd: root,
  stdio: 'inherit',
});

console.log(`📤 发布 v${version} 到 gh-pages...`);
const distDir = path.join(root, 'dist');
execSync(`git add -A && git commit -m "release: v${version}" && git push origin gh-pages`, {
  cwd: distDir,
  stdio: 'inherit',
});

console.log(`🏷️  创建并推送 git tag v${version}...`);
try {
  execSync(`git tag -a v${version} -m "Release v${version}"`, { cwd: root, stdio: 'inherit' });
} catch (e) {
  console.log(`   (tag v${version} 可能已存在，跳过创建)`);
}
execSync(`git push origin v${version}`, { cwd: root, stdio: 'inherit' });

console.log(`\n✅ 已正式发布 v${version} 到线上：https://handada888.github.io/startup-cemetery/\n`);
