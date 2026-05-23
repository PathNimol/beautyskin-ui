import { apiFetch } from '../client';
import type { ApiShopNameChangeRequest, PageData } from '../types';

export function list(params?: {
  shopId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.shopId) q.set('shopId', params.shopId);
  if (params?.status) q.set('status', params.status);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiShopNameChangeRequest>>(`/shop-name-change-requests?${q}`);
}

export function create(shopId: string, body: { requestedName: string }) {
  return apiFetch<ApiShopNameChangeRequest>(`/shop-name-change-requests?shopId=${shopId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function review(id: string, body: { status: 'APPROVED' | 'REJECTED'; notes?: string }) {
  return apiFetch<ApiShopNameChangeRequest>(`/shop-name-change-requests/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
