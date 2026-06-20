// 死亡原因枚举
export enum DeathReason {
  INDUSTRY_COMPETITION = '行业竞争',
  BUSINESS_MODEL = '商业模式匮乏',
  MARKET_PSEUDO_DEMAND = '市场伪需求',
  CASH_FLOW = '现金流断裂',
  BURN_RATE = '烧钱过度',
  FINANCING_FAILURE = '融资失败',
  TEAM_ISSUES = '团队问题',
  POLICY_REGULATION = '政策监管',
  TECHNOLOGY = '技术瓶颈',
  MARKETING = '营销不足',
  PIVOT_FAILURE = '转型失败',
  ACQUIRED_SHUTDOWN = '收购后关闭',
  FOUNDER_PROBLEM = '创始人问题',
  OTHER = '其他'
}

// 行业分类
export enum IndustryCategory {
  ECOMMERCE = '电商零售',
  O2O = '本地生活/O2O',
  EDUCATION = '在线教育',
  HEALTHCARE = '医疗健康',
  FINTECH = '金融科技',
  ENTERPRISE_SERVICE = '企业服务/SaaS',
  AI = '人工智能',
  SOCIAL = '社交网络',
  ENTERTAINMENT = '文娱传媒',
  GAME = '游戏',
  TRANSPORTATION = '出行交通',
  TRAVEL = '旅游',
  REAL_ESTATE = '房产服务',
  AGRICULTURE = '农业',
  HARDWARE = '智能硬件',
  BLOCKCHAIN = '区块链/Web3',
  LOGISTICS = '物流仓储',
  SPORTS = '体育运动',
  AUTOMOBILE = '汽车交通',
  NEW_ENERGY = '新能源',
  OTHER_INDUSTRY = '其他'
}

// 融资状态
export enum FundingStatus {
  NOT_FUNDED = '尚未获投',
  ANGEL = '天使轮',
  PRE_A = 'Pre-A轮',
  A = 'A轮',
  A_PLUS = 'A+轮',
  B = 'B轮',
  B_PLUS = 'B+轮',
  C = 'C轮',
  C_PLUS = 'C+轮',
  D = 'D轮及以上',
  STRATEGIC = '战略投资',
  ACQUIRED = '已被收购',
  IPO = '已上市'
}

export interface FundingRound {
  round: string;
  date: string;
  amount: string;
  investors: string[];
}

export interface DeadCompany {
  id: string;
  name: string;
  fullName?: string;
  logo?: string;
  description: string;
  industry: string;
  subIndustry?: string;
  location: string;
  foundedDate: string;
  closedDate: string;
  lifespan: string;
  fundingStatus: string;
  fundingRounds?: FundingRound[];
  totalFunding?: string;
  deathReasons: string[];
  deathAnalysis?: string;
  founder?: string;
  employeeCount?: string;
  tags?: string[];
  source?: string;
  lessons?: string;
  isUserSubmitted?: boolean;
  incenseCount: number;
  createdAt: string;
}

export interface FilterState {
  industries: string[];
  deathReasons: string[];
  fundingStages: string[];
  yearRange: [number, number];
  lifespanRange: [number, number];
  keyword: string;
  sortBy: 'closedDate' | 'lifespan' | 'incenseCount' | 'totalFunding';
  sortOrder: 'asc' | 'desc';
}

export interface StatsData {
  deathReasonStats: { name: string; count: number; percentage: number }[];
  industryStats: { name: string; count: number; percentage: number }[];
  yearlyStats: { year: number; count: number }[];
  fundingStats: { name: string; count: number }[];
  lifespanStats: { range: string; count: number }[];
}
