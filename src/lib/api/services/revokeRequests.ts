import { apiFetch } from '../client';
import type { ApiRevokeRequest, PageData } from '../types';

export function list(shopId: string, params?: { status?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams({ shopId });
  if (params?.status) q.set('status', params.status);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiRevokeRequest>>(`/revoke-requests?${q}`);
}

export function create(shopId: string, body: { productId: string; quantity: number; reason: string; detail?: string }) {
  return apiFetch<ApiRevokeRequest>(`/revoke-requests?shopId=${shopId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function review(id: string, body: { status: string; notes?: string }) {
  return apiFetch<ApiRevokeRequest>(`/revoke-requests/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
