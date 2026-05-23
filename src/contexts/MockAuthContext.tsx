'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isPublicRoute } from '@/lib/auth/publicRoutes';
import { normalizeRoleKey } from '@/lib/auth/redirects';
import { authApi, mapApiUserToMock, saveAuthTokens, clearAuthTokens, ApiError } from '@/lib/api';
import type { TokenPayload } from '@/lib/api/services/auth';
import type { RegisterPendingResponse } from '@/lib/api/types';
import { SESSION_KEY, TOKEN_KEY } from '@/lib/api/config';
import type { MockUser, UserRole, CustomerShipping } from '@/lib/mock/data';

type OAuthProvider = 'google' | 'facebook' | 'tiktok';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

/** Spring API only registers CUSTOMER accounts — UI restricts self-signup accordingly. */
interface RegisterPendingInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface MockAuthContextType {
  user: MockUser | null;
  loading: boolean;
  role: UserRole | null;
  shopId: string | null;
  signIn: (email: string, password: string) => Promise<MockUser>;
  signInWithOAuth: (provider: OAuthProvider) => void;
  /** Finish browser OAuth redirect (tokens in query from API success handler). */
  completeOAuthLogin: (tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) => Promise<MockUser>;
  registerPending: (input: RegisterPendingInput) => Promise<RegisterPendingResponse>;
  confirmRegistration: (email: string, code: string) => Promise<MockUser>;
  signOut: () => Promise<void>;
  refreshSession: () => boolean;
  updateProfile: (patch: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    avatarAlt?: string;
    shipping?: Partial<CustomerShipping>;
  }) => Promise<void>;
  isAuthenticated: boolean;
}

const MockAuthContext = createContext<MockAuthContextType | null>(null);

export const useMockAuth = () => {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useMockAuth must be used within MockAuthProvider');
  return ctx;
};

function normalizeRole(role: string): UserRole {
  const key = normalizeRoleKey(role);
  if (key === 'admin' || key === 'owner' || key === 'staff' || key === 'customer') {
    return key;
  }
  return 'customer';
}

function normalizeUser(u: MockUser): MockUser {
  return { ...u, role: normalizeRole(u.role as string) };
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function persistSession(
  user: MockUser,
  tokens: { accessToken: string; refreshToken: string; expiresIn: number }
) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  saveAuthTokens(tokens);
  setCookie('bs_session', user.id);
}

function readCachedUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return normalizeUser(JSON.parse(raw) as MockUser);
  } catch {
    return null;
  }
}

function initialAuthLoading(pathname: string): boolean {
  if (typeof window === 'undefined') return true;
  const hasTokens = !!localStorage.getItem(TOKEN_KEY);
  if (!hasTokens) return false;
  // Keep loading true until the first session sync — avoids SSR/client role mismatch
  if (!isPublicRoute(pathname) && hasTokens) return true;
  return false;
}

export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<MockUser | null>(() => readCachedUser());
  const [loading, setLoading] = useState(() => initialAuthLoading(pathname));
  const protectedSessionSynced = useRef(false);
  /** Skip redundant GET /users/me right after login/register (user already in token response). */
  const skipNextPublicLoadSession = useRef(false);

  const loadSession = useCallback(async (options?: { blockUi?: boolean }) => {
    const blockUi = options?.blockUi ?? true;
    if (blockUi) setLoading(true);
    try {
      const tokensRaw = localStorage.getItem(TOKEN_KEY);
      if (!tokensRaw) {
        setUser(null);
        return;
      }
      const apiUser = await authApi.getMe();
      const mapped = normalizeUser(mapApiUserToMock(apiUser));
      setUser(mapped);
      localStorage.setItem(SESSION_KEY, JSON.stringify(mapped));
      setCookie('bs_session', mapped.id);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      clearAuthTokens();
      deleteCookie('bs_session');
      setUser(null);
    } finally {
      if (blockUi) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isPublic = isPublicRoute(pathname);
    const hasTokens = typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY);

    if (isPublic && !hasTokens) {
      setUser(null);
      setLoading(false);
      protectedSessionSynced.current = false;
      return;
    }

    if (isPublic && hasTokens) {
      setLoading(false);
      if (skipNextPublicLoadSession.current) {
        skipNextPublicLoadSession.current = false;
        return;
      }
      void loadSession({ blockUi: false });
      return;
    }

    // Protected routes: sync session once — do not refetch on every sidebar navigation
    const cached = readCachedUser();
    if (cached) {
      setUser((prev) => prev ?? cached);
      setLoading(false);
      if (!protectedSessionSynced.current) {
        protectedSessionSynced.current = true;
        void loadSession({ blockUi: false });
      }
      return;
    }

    void loadSession({ blockUi: true }).then(() => {
      protectedSessionSynced.current = true;
    });
  }, [pathname, loadSession]);

  const establishFromTokenPayload = useCallback((res: TokenPayload): MockUser => {
    const normalized = normalizeUser(mapApiUserToMock(res.user));
    protectedSessionSynced.current = true;
    skipNextPublicLoadSession.current = true;
    setUser(normalized);
    persistSession(normalized, {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresIn: res.expiresIn,
    });
    return normalized;
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      return establishFromTokenPayload(res);
    },
    [establishFromTokenPayload]
  );

  const signInWithOAuth = useCallback((provider: OAuthProvider) => {
    // Spring Security: GET /oauth2/authorization/{provider} → Google → /login/oauth2/code/{provider} → UI callback
    window.location.href = `${API_BASE.replace('/api', '')}/oauth2/authorization/${provider}`;
  }, []);

  const completeOAuthLogin = useCallback(
    async (tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => {
      saveAuthTokens(tokens);
      const apiUser = await authApi.getMe();
      const normalized = normalizeUser(mapApiUserToMock(apiUser));
      protectedSessionSynced.current = true;
      skipNextPublicLoadSession.current = true;
      setUser(normalized);
      localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
      setCookie('bs_session', normalized.id);
      return normalized;
    },
    []
  );

  const registerPending = useCallback(async (input: RegisterPendingInput) => {
    return authApi.register({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      password: input.password,
      confirmPassword: input.confirmPassword,
    });
  }, []);

  const confirmRegistration = useCallback(
    async (email: string, code: string) => {
      const res = await authApi.confirmRegistration({ email, code });
      return establishFromTokenPayload(res);
    },
    [establishFromTokenPayload]
  );

  const signOut = useCallback(async () => {
    protectedSessionSynced.current = false;
    try {
      const tokensRaw = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      if (tokensRaw) {
        const parsed = JSON.parse(tokensRaw) as { refreshToken?: string };
        if (parsed.refreshToken) {
          await authApi.logout(parsed.refreshToken);
        }
      }
    } catch {
      /* ignore network / revoke failures */
    }
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    clearAuthTokens();
    deleteCookie('bs_session');
  }, []);

  const refreshSession = (): boolean => {
    void loadSession();
    return true;
  };

  const updateProfile = useCallback(
    async (patch: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
      avatarAlt?: string;
      shipping?: Partial<CustomerShipping>;
    }) => {
      if (!user) return;
      // Build body matching the API payload exactly
      const body: Record<string, unknown> = {};
      if (patch.firstName) body.firstName = patch.firstName;
      if (patch.lastName) body.lastName = patch.lastName;
      if (patch.phone) body.phone = patch.phone;
      if (patch.avatar) body.avatar = patch.avatar;
      if (patch.avatarAlt) body.avatarAlt = patch.avatarAlt;
      if (patch.shipping)
        body.shipping = { ...(user.shipping ?? emptyShipping(user)), ...patch.shipping };
      const updated = await authApi.updateProfile(body);
      const normalized = normalizeUser(mapApiUserToMock(updated));
      setUser(normalized);
      const tokensRaw = localStorage.getItem(TOKEN_KEY);
      const tokens = tokensRaw
        ? (JSON.parse(tokensRaw) as {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
          })
        : null;
      if (tokens?.accessToken) persistSession(normalized, tokens);
    },
    [user]
  );

  return (
    <MockAuthContext.Provider
      value={{
        user,
        loading,
        role: user?.role ?? null,
        shopId: user?.shopId ?? null,
        signIn,
        signInWithOAuth,
        completeOAuthLogin,
        registerPending,
        confirmRegistration,
        signOut,
        refreshSession,
        // Expose as async so callers can await and catch errors
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
};

function emptyShipping(user: MockUser): CustomerShipping {
  const [first = '', last = ''] = user.name.split(' ');
  return {
    firstName: first,
    lastName: last,
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'Cambodia',
  };
}
