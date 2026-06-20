import { DeadCompany, StatsData } from '../types';

export function computeStats(companies: DeadCompany[]): StatsData {
  // Death reason stats
  const reasonCount: Record<string, number> = {};
  companies.forEach(c => {
    c.deathReasons.forEach(r => {
      reasonCount[r] = (reasonCount[r] || 0) + 1;
    });
  });
  const totalReasonMentions = Object.values(reasonCount).reduce((a, b) => a + b, 0);
  const deathReasonStats = Object.entries(reasonCount)
    .map(([name, count]) => ({ name, count, percentage: Math.round(count / totalReasonMentions * 100) }))
    .sort((a, b) => b.count - a.count);

  // Industry stats
  const industryCount: Record<string, number> = {};
  companies.forEach(c => {
    industryCount[c.industry] = (industryCount[c.industry] || 0) + 1;
  });
  const total = companies.length;
  const industryStats = Object.entries(industryCount)
    .map(([name, count]) => ({ name, count, percentage: Math.round(count / total * 100) }))
    .sort((a, b) => b.count - a.count);

  // Yearly stats
  const yearCount: Record<number, number> = {};
  companies.forEach(c => {
    const year = new Date(c.closedDate).getFullYear();
    if (!isNaN(year)) {
      yearCount[year] = (yearCount[year] || 0) + 1;
    }
  });
  const yearlyStats = Object.entries(yearCount)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  // Funding stats
  const fundingCount: Record<string, number> = {};
  companies.forEach(c => {
    fundingCount[c.fundingStatus] = (fundingCount[c.fundingStatus] || 0) + 1;
  });
  const fundingStats = Object.entries(fundingCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Lifespan stats
  const ranges = [
    { range: '1年以内', min: 0, max: 12 },
    { range: '1-2年', min: 12, max: 24 },
    { range: '2-3年', min: 24, max: 36 },
    { range: '3-5年', min: 36, max: 60 },
    { range: '5-10年', min: 60, max: 120 },
    { range: '10年以上', min: 120, max: 999 },
  ];
  const lifespanStats = ranges.map(({ range, min, max }) => {
    const count = companies.filter(c => {
      const months = parseLifespanMonths(c.lifespan);
      return months >= min && months < max;
    }).length;
    return { range, count };
  });

  return { deathReasonStats, industryStats, yearlyStats, fundingStats, lifespanStats };
}

function parseLifespanMonths(lifespan: string): number {
  const yearMatch = lifespan.match(/(\d+)年/);
  const monthMatch = lifespan.match(/(\d+)个月/);
  const years = yearMatch ? parseInt(yearMatch[1]) : 0;
  const months = monthMatch ? parseInt(monthMatch[1]) : 0;
  return years * 12 + months;
}
