import { apiFetch } from '../client';
import type { ApiSupplierPurchase, PageData } from '../types';

export function list(shopId?: string, params?: { status?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (shopId) q.set('shopId', shopId);
  if (params?.status) q.set('status', params.status);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiSupplierPurchase>>(`/supplier-purchases?${q}`);
}

export function create(shopId: string, body: Record<string, unknown>) {
  return apiFetch<ApiSupplierPurchase>(`/supplier-purchases?shopId=${shopId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateStatus(id: string, status: string) {
  return apiFetch<ApiSupplierPurchase>(`/supplier-purchases/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
