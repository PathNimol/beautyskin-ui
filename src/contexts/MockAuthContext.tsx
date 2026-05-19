'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, mapApiUserToMock, saveAuthTokens, clearAuthTokens, ApiError } from '@/lib/api';
import { SESSION_KEY, TOKEN_KEY } from '@/lib/api/config';
import type { MockUser, UserRole, CustomerShipping } from '@/lib/mock/data';

type OAuthProvider = 'google' | 'facebook' | 'tiktok';

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  uiRole: string;
}

interface MockAuthContextType {
  user: MockUser | null;
  loading: boolean;
  role: UserRole | null;
  shopId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  register: (input: RegisterInput) => Promise<MockUser>;
  signOut: () => void;
  refreshSession: () => boolean;
  updateProfile: (patch: Partial<MockUser> & { shipping?: Partial<CustomerShipping> }) => void;
  isAuthenticated: boolean;
}

const MockAuthContext = createContext<MockAuthContextType | null>(null);

export const useMockAuth = () => {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useMockAuth must be used within MockAuthProvider');
  return ctx;
};

function normalizeRole(role: string): UserRole {
  if (role === 'buyer') return 'customer';
  return role.toLowerCase() as UserRole;
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

function persistSession(user: MockUser, tokens: { accessToken: string; refreshToken: string; expiresIn: number }) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  saveAuthTokens(tokens);
  setCookie('bs_session', user.id);
}

export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const tokensRaw = localStorage.getItem(TOKEN_KEY);
      if (!tokensRaw) {
        setLoading(false);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const establishSession = (apiUser: ReturnType<typeof mapApiUserToMock>, tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) => {
    const normalized = normalizeUser(apiUser);
    setUser(normalized);
    persistSession(normalized, tokens);
  };

  const signIn = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    establishSession(mapApiUserToMock(res.user), {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresIn: res.expiresIn,
    });
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    const res = await authApi.oauth(provider);
    establishSession(mapApiUserToMock(res.user), {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresIn: res.expiresIn,
    });
  };

  const register = async (input: RegisterInput): Promise<MockUser> => {
    const res = await authApi.register({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      password: input.password,
      role: input.uiRole.toLowerCase() === 'customer' ? 'customer' : input.uiRole.toLowerCase(),
    });
    return mapApiUserToMock(res.user);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    clearAuthTokens();
    deleteCookie('bs_session');
  };

  const refreshSession = (): boolean => {
    loadSession();
    return true;
  };

  const updateProfile = async (patch: Partial<MockUser> & { shipping?: Partial<CustomerShipping> }) => {
    if (!user) return;
    try {
      const body: Record<string, unknown> = {};
      if (patch.name) body.name = patch.name;
      if (patch.phone) body.phone = patch.phone;
      if (patch.avatar) body.avatar = patch.avatar;
      if (patch.shipping) body.shipping = { ...(user.shipping ?? emptyShipping(user)), ...patch.shipping };
      const updated = await authApi.updateProfile(body);
      const normalized = normalizeUser(mapApiUserToMock(updated));
      setUser(normalized);
      const tokensRaw = localStorage.getItem(TOKEN_KEY);
      const tokens = tokensRaw ? JSON.parse(tokensRaw) : null;
      if (tokens) persistSession(normalized, tokens);
    } catch (e) {
      if (e instanceof ApiError) throw e;
    }
  };

  return (
    <MockAuthContext.Provider
      value={{
        user,
        loading,
        role: user?.role ?? null,
        shopId: user?.shopId ?? null,
        signIn,
        signInWithOAuth,
        register,
        signOut,
        refreshSession,
        updateProfile: (patch) => {
          void updateProfile(patch);
        },
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
