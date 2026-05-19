import { apiFetch } from '../client';
import type { ApiShop, PageData } from '../types';

export function listShops(params?: { status?: string; search?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiShop>>(`/shops?${q}`);
}

export function updateShopStatus(id: string, status: string) {
  return apiFetch<ApiShop>(`/shops/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function createShop(body: Record<string, unknown>) {
  return apiFetch<ApiShop>('/shops', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
