export function calculateLifespan(foundedDate: string, closedDate: string): string {
  const founded = new Date(foundedDate);
  const closed = new Date(closedDate);
  const diffMs = closed.getTime() - founded.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  if (years === 0) return `${months}个月`;
  if (months === 0) return `${years}年`;
  return `${years}年${months}个月`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}
