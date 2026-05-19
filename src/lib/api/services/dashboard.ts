import { apiFetch } from '../client';

export function adminDashboard() {
  return apiFetch<Record<string, unknown>>('/admin/dashboard');
}

export function shopDashboard(shopId?: string) {
  const q = shopId ? `?shopId=${shopId}` : '';
  return apiFetch<Record<string, unknown>>(`/dashboard${q}`);
}
