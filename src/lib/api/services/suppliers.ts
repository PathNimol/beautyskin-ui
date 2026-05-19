import { apiFetch } from '../client';
import type { ApiSupplier, PageData } from '../types';

export function listSuppliers(params?: { search?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiSupplier>>(`/suppliers?${q}`);
}
