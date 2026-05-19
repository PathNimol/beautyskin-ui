import { apiFetch } from '../client';
import type { ApiOrder, PageData } from '../types';

export function listOrders(params?: { shopId?: string; status?: string; search?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.shopId) q.set('shopId', params.shopId);
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiOrder>>(`/orders?${q}`);
}

export function updateOrderStatus(id: string, status: string) {
  return apiFetch<ApiOrder>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function bulkUpdateStatus(ids: string[], status: string) {
  return apiFetch<void>('/orders/bulk', {
    method: 'PATCH',
    body: JSON.stringify({ ids, status }),
  });
}

export function placeOrder(body: Record<string, unknown>) {
  return apiFetch<ApiOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
