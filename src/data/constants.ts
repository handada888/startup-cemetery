import { DeathReason, IndustryCategory, FundingStatus } from '../types';

export const DEATH_REASON_LABELS: Record<string, string> = {
  '行业竞争': '行业竞争',
  '商业模式匮乏': '商业模式匮乏',
  '市场伪需求': '市场伪需求',
  '现金流断裂': '现金流断裂',
  '烧钱过度': '烧钱过度',
  '融资失败': '融资失败',
  '团队问题': '团队问题',
  '政策监管': '政策监管',
  '技术瓶颈': '技术瓶颈',
  '营销不足': '营销不足',
  '转型失败': '转型失败',
  '收购后关闭': '收购后关闭',
  '创始人问题': '创始人问题',
  '其他': '其他',
};

export const DEATH_REASONS = Object.values(DeathReason);

export const INDUSTRY_LABELS: Record<string, string> = {
  '电商零售': '电商零售',
  '本地生活/O2O': '本地生活/O2O',
  '在线教育': '在线教育',
  '医疗健康': '医疗健康',
  '金融科技': '金融科技',
  '企业服务/SaaS': '企业服务/SaaS',
  '人工智能': '人工智能',
  '社交网络': '社交网络',
  '文娱传媒': '文娱传媒',
  '游戏': '游戏',
  '出行交通': '出行交通',
  '旅游': '旅游',
  '房产服务': '房产服务',
  '农业': '农业',
  '智能硬件': '智能硬件',
  '区块链/Web3': '区块链/Web3',
  '物流仓储': '物流仓储',
  '体育运动': '体育运动',
  '汽车交通': '汽车交通',
  '新能源': '新能源',
  '其他': '其他',
};

export const INDUSTRIES = Object.values(IndustryCategory);

export const FUNDING_STATUS_LABELS: Record<string, string> = {
  '尚未获投': '尚未获投',
  '天使轮': '天使轮',
  'Pre-A轮': 'Pre-A轮',
  'A轮': 'A轮',
  'A+轮': 'A+轮',
  'B轮': 'B轮',
  'B+轮': 'B+轮',
  'C轮': 'C轮',
  'C+轮': 'C+轮',
  'D轮及以上': 'D轮及以上',
  '战略投资': '战略投资',
  '已被收购': '已被收购',
  '已上市': '已上市',
};

export const FUNDING_STATUSES = Object.values(FundingStatus);

export const SORT_OPTIONS = [
  { label: '关闭时间', value: 'closedDate' },
  { label: '存活时间', value: 'lifespan' },
  { label: '上香数', value: 'incenseCount' },
  { label: '融资金额', value: 'totalFunding' },
];
