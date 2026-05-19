import { apiFetch } from '../client';
import type { ApiNotification, PageData } from '../types';

export function listNotifications(page = 1, limit = 50) {
  return apiFetch<PageData<ApiNotification>>(`/notifications?page=${page}&limit=${limit}`);
}

export function markRead(id: string) {
  return apiFetch<ApiNotification>(`/notifications/${id}/read`, { method: 'PATCH' });
}
