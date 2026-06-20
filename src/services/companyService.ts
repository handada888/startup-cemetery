import { DeadCompany, FilterState } from '../types';
import { getSubmissions, getIncenseData } from './storage';

const API_BASE = '';

export async function loadCompanies(): Promise<DeadCompany[]> {
  // Try API first, fallback to static import
  try {
    const resp = await fetch(`${API_BASE}/api/companies`);
    if (!resp.ok) throw new Error('API failed');
    const preloaded: DeadCompany[] = await resp.json();
    const submissions = getSubmissions<DeadCompany>();
    const incenseData = getIncenseData();
    
    const allCompanies = [...preloaded, ...submissions].map(c => ({
      ...c,
      incenseCount: c.incenseCount + (incenseData[c.id] || 0)
    }));
    
    return allCompanies;
  } catch {
    // Fallback to static import (for dev/preview without backend)
    const preloaded = (await import('../data/companies.json')).default as DeadCompany[];
    const submissions = getSubmissions<DeadCompany>();
    const incenseData = getIncenseData();
    
    const allCompanies = [...preloaded, ...submissions].map(c => ({
      ...c,
      incenseCount: c.incenseCount + (incenseData[c.id] || 0)
    }));
    
    return allCompanies;
  }
}

// Admin API functions
export async function createCompany(company: Partial<DeadCompany>): Promise<DeadCompany> {
  const resp = await fetch('/api/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(company),
  });
  if (!resp.ok) throw new Error('Failed to create company');
  return resp.json();
}

export async function updateCompany(id: string, updates: Partial<DeadCompany>): Promise<DeadCompany> {
  const resp = await fetch(`/api/companies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!resp.ok) throw new Error('Failed to update company');
  return resp.json();
}

export async function deleteCompany(id: string): Promise<void> {
  const resp = await fetch(`/api/companies/${id}`, {
    method: 'DELETE',
  });
  if (!resp.ok) throw new Error('Failed to delete company');
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
