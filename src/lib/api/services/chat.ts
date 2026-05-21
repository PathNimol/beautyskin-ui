import { apiFetch } from '../client';
import type { ApiChatMessage, ApiChatRoom, PageData } from '../types';

export function listRooms() {
  return apiFetch<ApiChatRoom[]>('/chat/rooms');
}

export function listMessages(roomId: string, page = 1, limit = 50) {
  return apiFetch<PageData<ApiChatMessage>>(`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
}

export function sendMessage(roomId: string, content: string) {
  return apiFetch<ApiChatMessage>(`/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
