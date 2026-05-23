import { apiFetch } from '../client';
import type { ApiUser, RegisterPendingResponse } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

/** Matches Spring `RegisterRequest` (includes confirmPassword). Only CUSTOMER signup is supported server-side. */
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: ApiUser;
}

export interface ConfirmRegistrationPayload {
  email: string;
  code: string;
}

export function login(payload: LoginPayload) {
  return apiFetch<TokenPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
}

/** Creates PENDING_EMAIL_VERIFICATION account; OTP sent server-side (REGISTER_EMAIL). */
export function register(payload: RegisterPayload) {
  return apiFetch<RegisterPendingResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
}

export function confirmRegistration(payload: ConfirmRegistrationPayload) {
  return apiFetch<TokenPayload>('/auth/register/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
}

export function logout(refreshToken: string) {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
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

export function forgotPassword(email: string) {
  return apiFetch<void>('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, false);
}

export function resetPassword(email: string, code: string, newPassword: string) {
  return apiFetch<void>('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  }, false);
}

export function getShipping() {
  return apiFetch<ApiUser['shipping']>('/users/me/shipping');
}

export function updateShipping(shipping: NonNullable<ApiUser['shipping']>) {
  return apiFetch<ApiUser['shipping']>('/users/me/shipping', {
    method: 'PATCH',
    body: JSON.stringify(shipping),
  });
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
