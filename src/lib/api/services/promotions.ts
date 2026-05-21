import { apiFetch } from '../client';
import type { ApiPromotion, PageData } from '../types';

export function listPromotions(shopId?: string, params?: { status?: string; search?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (shopId) q.set('shopId', shopId);
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiPromotion>>(`/promotions?${q}`);
}

export function createPromotion(shopId: string, body: Record<string, unknown>) {
  return apiFetch<ApiPromotion>(`/promotions?shopId=${shopId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updatePromotion(id: string, body: Record<string, unknown>) {
  return apiFetch<ApiPromotion>(`/promotions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function updatePromotionStatus(id: string, status: string) {
  return apiFetch<ApiPromotion>(`/promotions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deletePromotion(id: string) {
  return apiFetch<void>(`/promotions/${id}`, { method: 'DELETE' });
}
