'use client';

import { useEffect, useRef } from 'react';
import { API_BASE_URL, TOKEN_KEY } from '@/lib/api/config';
import type { ApiNotification } from '@/lib/api/types';
import { useMockAuth } from '@/contexts/MockAuthContext';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed.accessToken ?? null;
  } catch {
    return null;
  }
}

type Listener = (notification: ApiNotification) => void;

/** One EventSource per tab; multiple hooks subscribe via listeners. */
let sharedSource: EventSource | null = null;
let sharedToken: string | null = null;
const listeners = new Set<Listener>();

function ensureSharedStream(token: string) {
  if (sharedSource && sharedToken === token) {
    return;
  }
  if (sharedSource) {
    sharedSource.close();
    sharedSource = null;
  }
  sharedToken = token;
  const url = `${API_BASE_URL}/notifications/stream?access_token=${encodeURIComponent(token)}`;
  sharedSource = new EventSource(url);

  const handleNotification = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string) as ApiNotification;
      if (data?.id) {
        listeners.forEach((fn) => fn(data));
      }
    } catch {
      // ignore malformed payloads
    }
  };

  sharedSource.addEventListener('notification', handleNotification);

  sharedSource.onerror = () => {
    sharedSource?.close();
    sharedSource = null;
    sharedToken = null;
    if (listeners.size > 0) {
      const retryToken = getAccessToken();
      if (retryToken) {
        window.setTimeout(() => ensureSharedStream(retryToken), 5000);
      }
    }
  };
}

function releaseSharedStream(listener: Listener) {
  listeners.delete(listener);
  if (listeners.size === 0 && sharedSource) {
    sharedSource.close();
    sharedSource = null;
    sharedToken = null;
  }
}

/**
 * Subscribes to GET /notifications/stream (SSE). Invokes callback when a new notification is pushed.
 */
export function useNotificationStream(onNotification: (notification: ApiNotification) => void) {
  const { isAuthenticated } = useMockAuth();
  const handlerRef = useRef(onNotification);
  handlerRef.current = onNotification;

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    const listener: Listener = (n) => handlerRef.current(n);
    listeners.add(listener);
    ensureSharedStream(token);

    return () => releaseSharedStream(listener);
  }, [isAuthenticated]);
}
