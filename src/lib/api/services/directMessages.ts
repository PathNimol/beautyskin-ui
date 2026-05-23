import { apiFetch } from '../client';
import type { ApiDirectMessage, ApiDirectThread, PageData } from '../types';

export function listThreads() {
  return apiFetch<ApiDirectThread[]>('/messages/threads');
}

export function listMessages(threadId: string, page = 1, limit = 50) {
  return apiFetch<PageData<ApiDirectMessage>>(`/messages/threads/${threadId}?page=${page}&limit=${limit}`);
}

export function send(body: { recipientId: string; content: string }) {
  return apiFetch<ApiDirectMessage>('/messages', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function markRead(threadId: string) {
  return apiFetch<void>('/messages/read', {
    method: 'PATCH',
    body: JSON.stringify({ threadId }),
  });
}
