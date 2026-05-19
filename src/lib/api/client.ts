import { API_BASE_URL, TOKEN_KEY } from './config';
import type { ApiResponse, AuthTokens } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

function setStoredTokens(tokens: AuthTokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

async function refreshTokens(): Promise<AuthTokens | null> {
  const current = getStoredTokens();
  if (!current?.refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>;
    const tokens: AuthTokens = {
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
      expiresIn: json.data.expiresIn,
    };
    setStoredTokens(tokens);
    return tokens;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const tokens = getStoredTokens();
    if (tokens?.accessToken) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
  }

  let res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && auth) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
      res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    }
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok) {
    throw new ApiError(json?.message || res.statusText || 'Request failed', res.status);
  }

  if (!json || json.status === 'error') {
    throw new ApiError(json?.message || 'API error');
  }

  return json.data;
}

export function saveAuthTokens(tokens: AuthTokens) {
  setStoredTokens(tokens);
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY);
}
