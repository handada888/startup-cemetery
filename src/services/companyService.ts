import { DeadCompany, FilterState } from '../types';
import { getSubmissions, getIncenseData } from './storage';

// GitHub 配置 - 用 GitHub API 作为后端存储
const GITHUB_OWNER = 'handada888';
const GITHUB_REPO = 'startup-cemetery';
const GITHUB_BRANCH = 'main';
const GITHUB_DATA_PATH = 'src/data/companies.json';

// 从 localStorage 读取 GitHub Token
function getGitHubToken(): string | null {
  return localStorage.getItem('cemetery_github_token');
}

// 加载公司数据：先尝试 GitHub API（有 token 时），否则用静态 JSON
export async function loadCompanies(): Promise<DeadCompany[]> {
  let preloaded: DeadCompany[];

  // 尝试从 GitHub API 加载最新数据
  const token = getGitHubToken();
  if (token) {
    try {
      const resp = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}?ref=${GITHUB_BRANCH}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        const content = atob(data.content.replace(/\n/g, ''));
        preloaded = JSON.parse(content);
      } else {
        preloaded = (await import('../data/companies.json')).default as DeadCompany[];
      }
    } catch {
      preloaded = (await import('../data/companies.json')).default as DeadCompany[];
    }
  } else {
    // 没有 token，用打包的静态数据
    preloaded = (await import('../data/companies.json')).default as DeadCompany[];
  }

  const submissions = getSubmissions<DeadCompany>();
  const incenseData = getIncenseData();

  const allCompanies = [...preloaded, ...submissions].map(c => ({
    ...c,
    incenseCount: c.incenseCount + (incenseData[c.id] || 0)
  }));

  return allCompanies;
}

// 获取当前文件的 GitHub SHA（更新文件时需要）
async function getFileSha(token: string): Promise<string> {
  const resp = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (!resp.ok) throw new Error('无法获取文件信息');
  const data = await resp.json();
  return data.sha;
}

// 读取当前所有数据
async function readAllCompanies(token: string): Promise<DeadCompany[]> {
  const resp = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (!resp.ok) throw new Error('无法读取数据');
  const data = await resp.json();
  const content = atob(data.content.replace(/\n/g, ''));
  return JSON.parse(content);
}

// 写入所有数据到 GitHub
async function writeAllCompanies(token: string, companies: DeadCompany[]): Promise<void> {
  const sha = await getFileSha(token);
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(companies, null, 2))));
  const resp = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `数据更新 - ${new Date().toISOString()}`,
        content,
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.message || '写入失败');
  }
}

// 新增公司
export async function createCompany(company: Partial<DeadCompany>): Promise<DeadCompany> {
  const token = getGitHubToken();
  if (!token) throw new Error('请先在管理后台设置 GitHub Token');

  const companies = await readAllCompanies(token);
  const newCompany: DeadCompany = {
    ...company as DeadCompany,
    id: company.id || `sc-${String(Date.now()).slice(-6)}`,
    incenseCount: company.incenseCount || 0,
    createdAt: new Date().toISOString(),
  };
  companies.push(newCompany);
  await writeAllCompanies(token, companies);
  return newCompany;
}

// 更新公司
export async function updateCompany(id: string, updates: Partial<DeadCompany>): Promise<DeadCompany> {
  const token = getGitHubToken();
  if (!token) throw new Error('请先在管理后台设置 GitHub Token');

  const companies = await readAllCompanies(token);
  const idx = companies.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('公司不存在');
  companies[idx] = { ...companies[idx], ...updates, id };
  await writeAllCompanies(token, companies);
  return companies[idx];
}

// 删除公司
export async function deleteCompany(id: string): Promise<void> {
  const token = getGitHubToken();
  if (!token) throw new Error('请先在管理后台设置 GitHub Token');

  const companies = await readAllCompanies(token);
  const filtered = companies.filter(c => c.id !== id);
  if (filtered.length === companies.length) throw new Error('公司不存在');
  await writeAllCompanies(token, filtered);
}

export function filterCompanies(companies: DeadCompany[], filters: FilterState): DeadCompany[] {
  return companies.filter(c => {
    if (filters.industries.length > 0 && !filters.industries.includes(c.industry)) return false;
    if (filters.deathReasons.length > 0 && !c.deathReasons.some(r => filters.deathReasons.includes(r))) return false;
    if (filters.fundingStages.length > 0 && !filters.fundingStages.includes(c.fundingStatus)) return false;
    if (filters.keyword && !c.name.includes(filters.keyword) && !c.description.includes(filters.keyword)) return false;

    const closeYear = new Date(c.closedDate).getFullYear();
    if (closeYear < filters.yearRange[0] || closeYear > filters.yearRange[1]) return false;

    const months = parseLifespanMonths(c.lifespan);
    if (months < filters.lifespanRange[0] || months > filters.lifespanRange[1]) return false;

    return true;
  });
}

function parseLifespanMonths(lifespan: string): number {
  const yearMatch = lifespan.match(/(\d+)年/);
  const monthMatch = lifespan.match(/(\d+)个月/);
  const years = yearMatch ? parseInt(yearMatch[1]) : 0;
  const months = monthMatch ? parseInt(monthMatch[1]) : 0;
  return years * 12 + months;
}

export function sortCompanies(companies: DeadCompany[], sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']): DeadCompany[] {
  return [...companies].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'closedDate':
        cmp = new Date(a.closedDate).getTime() - new Date(b.closedDate).getTime();
        break;
      case 'lifespan':
        cmp = parseLifespanMonths(a.lifespan) - parseLifespanMonths(b.lifespan);
        break;
      case 'incenseCount':
        cmp = a.incenseCount - b.incenseCount;
        break;
      case 'totalFunding':
        cmp = (a.totalFunding?.length || 0) - (b.totalFunding?.length || 0);
        break;
    }
    return sortOrder === 'desc' ? -cmp : cmp;
  });
}
