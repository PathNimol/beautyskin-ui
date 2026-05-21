import { apiFetch } from '../client';
import type { ApiPosReceipt, PageData } from '../types';

export function listReceipts(shopId: string, page = 1, limit = 50) {
  return apiFetch<PageData<ApiPosReceipt>>(`/pos/receipts?shopId=${shopId}&page=${page}&limit=${limit}`);
}

export function completeSale(shopId: string, body: Record<string, unknown>) {
  return apiFetch<ApiPosReceipt>(`/pos/sales?shopId=${shopId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function cancelReceipt(id: string, shopId: string) {
  return apiFetch<ApiPosReceipt>(`/pos/receipts/${id}/cancel?shopId=${shopId}`, {
    method: 'POST',
  });
}
