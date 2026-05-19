export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8080/api';

export const TOKEN_KEY = 'bs_auth_tokens';
export const SESSION_KEY = 'bs_mock_session';
