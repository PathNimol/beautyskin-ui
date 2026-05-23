import { apiFetch } from '../client';
import { normalizePage } from '../normalizePage';
import type { ApiProduct, PageData } from '../types';

export async function listCatalog(params?: {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.category) q.set('category', params.category);
  if (params?.minPrice) q.set('minPrice', params.minPrice);
  if (params?.maxPrice) q.set('maxPrice', params.maxPrice);
  if (params?.sort) q.set('sort', params.sort);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 24));
  const raw = await apiFetch<unknown>(`/products?${q}`, {}, false);
  return normalizePage<ApiProduct>(raw);
}

export function getProduct(id: string) {
  return apiFetch<ApiProduct>(`/products/${id}`, {}, false);
}

export function listMerchant(shopId: string, params?: { search?: string; category?: string; status?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams({ shopId });
  if (params?.search) q.set('search', params.search);
  if (params?.category) q.set('category', params.category);
  if (params?.status) q.set('status', params.status);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 8));
  return apiFetch<PageData<ApiProduct>>(`/products/merchant?${q}`);
}

export async function getFeatured(page = 1, limit = 8) {
  const raw = await apiFetch<unknown>(`/catalog/featured?page=${page}&limit=${limit}`, {}, false);
  return normalizePage<ApiProduct>(raw);
}

export function getReviews(productId: string, page = 1, limit = 20) {
  return apiFetch<PageData<Record<string, unknown>>>(`/products/${productId}/reviews?page=${page}&limit=${limit}`, {}, false);
}

export function submitReview(productId: string, body: { rating: number; title: string; body: string; skinType?: string }) {
  return apiFetch<Record<string, unknown>>(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function createProduct(shopId: string, body: Record<string, unknown>) {
  return apiFetch<ApiProduct>(`/products/shops/${shopId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateProduct(shopId: string, productId: string, body: Record<string, unknown>) {
  return apiFetch<ApiProduct>(`/products/shops/${shopId}/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteProduct(shopId: string, productId: string) {
  return apiFetch<void>(`/products/shops/${shopId}/${productId}`, { method: 'DELETE' });
}
