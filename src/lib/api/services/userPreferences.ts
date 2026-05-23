import { apiFetch } from '../client';
import type { ApiUserPreferences } from '../types';

export function get() {
  return apiFetch<ApiUserPreferences>('/users/me/preferences');
}

export function update(prefs: Partial<ApiUserPreferences>) {
  return apiFetch<ApiUserPreferences>('/users/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify(prefs),
  });
}
