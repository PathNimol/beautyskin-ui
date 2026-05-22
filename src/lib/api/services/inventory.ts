import { apiFetch } from '../client';
import type { ApiInventoryItem, PageData } from '../types';

export function listInventory(shopId?: string, params?: { status?: string; search?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (shopId) q.set('shopId', shopId);
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 100));
  const path = shopId ? `/inventory?${q}` : `/inventory/platform?${q}`;
  return apiFetch<PageData<ApiInventoryItem>>(path);
}

export function createItem(shopId: string, body: Record<string, unknown>) {
  return apiFetch<ApiInventoryItem>(`/inventory?shopId=${shopId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function restock(id: string, quantity: number) {
  return apiFetch<ApiInventoryItem>(`/inventory/${id}/restock`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export function adjustStock(id: string, delta: number, notes?: string) {
  return apiFetch<ApiInventoryItem>(`/inventory/${id}/adjust`, {
    method: 'PATCH',
    body: JSON.stringify({ delta, notes }),
  });
}
