import { apiFetch } from '../client';
import type { ApiUser } from '../types';

export function getUsersByRole(role: 'OWNER' | 'ADMIN' | 'STAFF' | 'CUSTOMER') {
  return apiFetch<ApiUser[]>(`/users/by-role/${role}`);
}

export function getMe() {
  return apiFetch<ApiUser>('/users/me');
}

export function updateProfile(body: Record<string, unknown>) {
  return apiFetch<ApiUser>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
