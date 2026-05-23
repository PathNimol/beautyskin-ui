import { apiFetch } from '../client';
import type { ApiSupplier, PageData } from '../types';

export function listSuppliers(params?: { search?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiSupplier>>(`/suppliers?${q}`);
}

export function createSupplier(body: Record<string, unknown>) {
  return apiFetch<ApiSupplier>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateSupplier(id: string, body: Record<string, unknown>) {
  return apiFetch<ApiSupplier>(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteSupplier(id: string) {
  return apiFetch<void>(`/suppliers/${id}`, { method: 'DELETE' });
}
