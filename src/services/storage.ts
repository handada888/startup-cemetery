const SUBMISSIONS_KEY = 'cemetery_submissions';
const INCENSE_KEY = 'cemetery_incense';

export function getSubmissions<T>(): T[] {
  try {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addSubmission<T>(item: T): void {
  const submissions = getSubmissions<T>();
  submissions.push(item);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

export function getIncenseData(): Record<string, number> {
  try {
    const data = localStorage.getItem(INCENSE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function addIncense(companyId: string): number {
  const data = getIncenseData();
  data[companyId] = (data[companyId] || 0) + 1;
  localStorage.setItem(INCENSE_KEY, JSON.stringify(data));
  return data[companyId];
}
