import { apiFetch } from '../client';

export function getSummary(shopId?: string, range = '30d') {
  const q = new URLSearchParams({ range });
  if (shopId) q.set('shopId', shopId);
  return apiFetch<Record<string, unknown>>(`/analytics/summary?${q}`);
}
