import { apiFetch } from '../client';
import type { ApiUser, PageData } from '../types';

export function listCustomers(params?: { search?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 50));
  return apiFetch<PageData<ApiUser>>(`/customers?${q}`);
}

export function getCustomer(id: string) {
  return apiFetch<ApiUser>(`/customers/${id}`);
}

export function createCustomer(body: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}) {
  return apiFetch<ApiUser>('/customers', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateCustomer(
  id: string,
  body: { firstName?: string; lastName?: string; email?: string; phone?: string }
) {
  return apiFetch<ApiUser>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function updateCustomerStatus(id: string, status: string) {
  return apiFetch<ApiUser>(`/customers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function resetCustomerPassword(
  id: string,
  body: { newPassword: string; confirmPassword: string }
) {
  return apiFetch<void>(`/customers/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteCustomer(id: string) {
  return apiFetch<void>(`/customers/${id}`, { method: 'DELETE' });
}
