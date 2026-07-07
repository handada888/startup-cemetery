// 发布服务：通过 GitHub Contents API 把「main 分支的最新数据」部署到 gh-pages，
// 并在 main 分支标记版本发布时间。需要管理员在后台设置有效的 GitHub Token（repo 权限）。
// 注意：本文件运行在浏览器中，禁止使用 Node 专属 API（如 Buffer），统一用 atob/btoa。

const API = 'https://api.github.com';
const OWNER = 'handada888';
const REPO = 'startup-cemetery';
const GH_PAGES = 'gh-pages';
const MAIN = 'main';

// 文本 -> base64（兼容中文 / UTF-8）
function b64encodeText(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

// base64 -> 文本（兼容中文 / UTF-8）
function b64decodeText(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''));
  return decodeURIComponent(escape(bin));
}

// 大文件（>64KB）需用分块方式做 base64，否则 String.fromCharCode 会栈溢出
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
  }
  return btoa(binary);
}

async function ghGet(path: string, token: string, ref: string) {
  const r = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}?ref=${ref}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`读取 ${path} 失败: ${r.status}`);
  return r.json();
}

async function ghPut(path: string, contentB64: string, token: string, message: string, sha?: string) {
  const body: any = { message, content: contentB64, branch: GH_PAGES };
  if (sha) body.sha = sha;
  const r = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.message || `写入 ${path} 失败: ${r.status}`);
  }
  return r.json();
}

// 读取文件内容（base64）与 sha；不存在返回 null
async function getContent(path: string, token: string, ref: string): Promise<{ content: string; sha: string } | null> {
  const data = await ghGet(path, token, ref);
  if (!data) return null;
  return { content: data.content, sha: data.sha };
}

// 收集当前构建引用的所有静态资源（含动态 import 的 chunk）
async function collectAssetPaths(indexHtml: string, base: string): Promise<string[]> {
  const seen = new Set<string>();
  const found = new Set<string>();
  const queue: string[] = [];

  const pushIfNew = (u: string) => {
    if (u.startsWith(base) && !seen.has(u)) {
      seen.add(u);
      queue.push(u);
    }
  };

  const reTag = /(?:src|href)="([^"]+)"/g;
  let m;
  while ((m = reTag.exec(indexHtml))) pushIfNew(m[1]);
  // 兜底：动态 import 路径可能不带 src/href
  const reImport = /["']([^"']*assets\/[^"']+\.(?:js|css))["']/g;
  while ((m = reImport.exec(indexHtml))) pushIfNew(base + m[1].replace(base, ''));

  while (queue.length) {
    const u = queue.shift()!;
    if (found.has(u)) continue;
    found.add(u);
    try {
      const res = await fetch(u);
      const txt = await res.text();
      const reTag2 = /(?:src|href)="([^"]+)"/g;
      let m2;
      while ((m2 = reTag2.exec(txt))) pushIfNew(m2[1]);
      const reImport2 = /["']([^"']*assets\/[^"']+\.(?:js|css))["']/g;
      while ((m2 = reImport2.exec(txt))) pushIfNew(base + m2[1].replace(base, ''));
    } catch {
      /* 忽略单个资源读取失败 */
    }
  }
  return [...found];
}

export type PublishStatus = 'idle' | 'publishing' | 'success' | 'error';

export interface PublishProgress {
  step: string;
}

// 部署当前 main 分支的最新数据到 gh-pages，并在 main 标记版本已发布
export async function publishRelease(
  token: string,
  version: string,
  onProgress?: (msg: string) => void,
): Promise<void> {
  const log = (msg: string) => onProgress?.(msg);

  // 0. 校验 Token 有效性
  log('正在校验 GitHub Token...');
  const who = await fetch(`${API}/user`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!who.ok) {
    throw new Error('GitHub Token 无效或无权限，请确认 Token 具备 repo 权限');
  }

  // 1. 部署最新数据：main 的 src/data/companies.json -> gh-pages 的 data/companies.json
  log('正在部署最新案例数据...');
  const mainData = await getContent('src/data/companies.json', token, MAIN);
  if (mainData) {
    const existing = await ghGet('data/companies.json', token, GH_PAGES);
    await ghPut('data/companies.json', mainData.content, token, `deploy data: ${version}`, existing?.sha);
  } else {
    throw new Error('main 分支未找到 src/data/companies.json');
  }

  // 2. 部署版本信息：main 的 src/version.json -> gh-pages 的 data/version.json
  log('正在部署版本信息...');
  const mainVer = await getContent('src/version.json', token, MAIN);
  if (mainVer) {
    const existingVer = await ghGet('data/version.json', token, GH_PAGES);
    await ghPut('data/version.json', mainVer.content, token, `deploy version: ${version}`, existingVer?.sha);
  }

  // 3. 重新上传当前构建资源（HTML + JS/CSS），保持 gh-pages 与当前构建一致（尽力而为）
  try {
    const base = import.meta.env.BASE_URL || '/';
    const idxRes = await fetch(base + 'index.html', { cache: 'no-store' });
    if (idxRes.ok) {
      log('正在同步构建资源...');
      const idxText = await idxRes.text();
      const assets = await collectAssetPaths(idxText, base);
      for (const u of assets) {
        const rel = u.slice(base.length).replace(/^\/+/, '');
        const res = await fetch(u);
        const buf = await res.arrayBuffer();
        const b64 = arrayBufferToBase64(buf);
        const existing = await ghGet(rel, token, GH_PAGES);
        await ghPut(rel, b64, token, `deploy: ${version}`, existing?.sha);
      }
      const idxExisting = await ghGet('index.html', token, GH_PAGES);
      await ghPut('index.html', b64encodeText(idxText), token, `deploy: ${version}`, idxExisting?.sha);
      const nj = await ghGet('.nojekyll', token, GH_PAGES);
      await ghPut('.nojekyll', '', token, `deploy: ${version}`, nj?.sha);
    }
  } catch (e) {
    // 资源重新上传失败不影响数据发布
    console.warn('重新上传构建资源失败（不影响数据发布）:', e);
  }

  // 4. 在 main 分支标记版本已发布（部署 main 的快照意味着当前及之前所有版本均已上线）
  log('正在标记版本发布状态...');
  if (mainVer) {
    const ver = JSON.parse(b64decodeText(mainVer.content));
    ver.releasedAt = new Date().toISOString().slice(0, 10);
    if (Array.isArray(ver.changelog)) {
      for (const c of ver.changelog) c.released = true;
    }
    await ghPut('src/version.json', b64encodeText(JSON.stringify(ver, null, 2)), token, `release: ${version}`, mainVer.sha);
  }

  log('发布完成 ✅');
}
