import { apiFetch } from '../client';
import type { ApiInventoryItem, PageData } from '../types';

export function listInventory(shopId: string, params?: { status?: string; search?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams({ shopId });
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 100));
  return apiFetch<PageData<ApiInventoryItem>>(`/inventory?${q}`);
}

export function restock(id: string, quantity: number) {
  return apiFetch<ApiInventoryItem>(`/inventory/${id}/restock`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}
