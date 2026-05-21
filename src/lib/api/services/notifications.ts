import { apiFetch } from '../client';
import type { ApiNotification, PageData } from '../types';

export function listNotifications(page = 1, limit = 50) {
  return apiFetch<PageData<ApiNotification>>(`/notifications?page=${page}&limit=${limit}`);
}

export function markRead(id: string) {
  return apiFetch<ApiNotification>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllRead() {
  return apiFetch<void>('/notifications/read-all', { method: 'PATCH' });
}

export function deleteNotification(id: string) {
  return apiFetch<void>(`/notifications/${id}`, { method: 'DELETE' });
}
