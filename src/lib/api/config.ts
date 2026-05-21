/**
 * Backend REST base URL (must include `/api` application context path).
 * Set `NEXT_PUBLIC_API_URL` or `API_URL` in `.env`; see `next.config.mjs`.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') || 'http://localhost:8080/api'
);

/** When true, login uses built-in demo accounts without the Spring API. */
export const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export const TOKEN_KEY = 'bs_auth_tokens';
export const SESSION_KEY = 'bs_mock_session';
