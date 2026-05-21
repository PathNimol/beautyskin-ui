import { apiFetch } from '../client';
import type { ApiShopStaff, PageData } from '../types';

export function list(shopId: string, params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.role) q.set('role', params.role);
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiShopStaff>>(`/shops/${shopId}/users?${q}`);
}

export function create(shopId: string, body: Record<string, unknown>) {
  return apiFetch<ApiShopStaff>(`/shops/${shopId}/users`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function update(shopId: string, userId: string, body: Record<string, unknown>) {
  return apiFetch<ApiShopStaff>(`/shops/${shopId}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function remove(shopId: string, userId: string) {
  return apiFetch<void>(`/shops/${shopId}/users/${userId}`, { method: 'DELETE' });
}
