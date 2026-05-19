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
