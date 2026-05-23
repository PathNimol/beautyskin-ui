import { apiFetch } from '../client';
import { parseAdminDashboard, type AdminDashboardData } from '../types/adminDashboard';

export function adminDashboard() {
  return apiFetch<Record<string, unknown>>('/admin/dashboard').then((raw) => {
    const parsed = parseAdminDashboard(raw);
    if (!parsed) throw new Error('Invalid admin dashboard response');
    return parsed;
  });
}

export type { AdminDashboardData };

export function shopDashboard(shopId?: string) {
  const q = shopId ? `?shopId=${shopId}` : '';
  return apiFetch<Record<string, unknown>>(`/dashboard${q}`);
}
