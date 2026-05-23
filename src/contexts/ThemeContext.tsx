'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { userPreferencesApi } from '@/lib/api';
import { applyTheme, readStoredTheme, themeFromDarkMode, type ThemeMode } from '@/lib/theme/theme';

interface ThemeContextValue {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useMockAuth();
  const [darkMode, setDarkModeState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) {
      applyTheme(stored);
      setDarkModeState(stored === 'dark');
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    userPreferencesApi
      .get()
      .then((p) => {
        const mode = themeFromDarkMode(p.darkMode);
        applyTheme(mode);
        setDarkModeState(p.darkMode);
      })
      .catch(() => {
        const stored = readStoredTheme();
        if (stored) setDarkModeState(stored === 'dark');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, hydrated]);

  const setDarkMode = useCallback((value: boolean) => {
    const mode: ThemeMode = value ? 'dark' : 'light';
    applyTheme(mode);
    setDarkModeState(value);
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}
