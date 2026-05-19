import { apiFetch } from '../client';
import type { ApiUser, AuthTokens } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: ApiUser;
}

export function login(payload: LoginPayload) {
  return apiFetch<TokenPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
}

export function register(payload: RegisterPayload) {
  return apiFetch<TokenPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
}

export function oauth(provider: string) {
  return apiFetch<TokenPayload>(`/auth/oauth/${provider}`, { method: 'POST' }, false);
}

export function sendOtp(email: string, purpose: string) {
  return apiFetch<void>('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ email, purpose }),
  }, false);
}

export function verifyOtp(email: string, purpose: string, code: string) {
  return apiFetch<void>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ email, purpose, code }),
  }, false);
}

export function resetPassword(email: string, code: string, newPassword: string) {
  return apiFetch<void>('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  }, false);
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
