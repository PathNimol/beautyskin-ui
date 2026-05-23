export const THEME_STORAGE_KEY = 'bs-theme';

export type ThemeMode = 'light' | 'dark';

export function readStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function themeFromDarkMode(dark: boolean): ThemeMode {
  return dark ? 'dark' : 'light';
}
