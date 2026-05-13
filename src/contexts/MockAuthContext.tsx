'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_USERS, type MockUser, type UserRole } from '@/lib/mock/data';

interface MockAuthContextType {
  user: MockUser | null;
  loading: boolean;
  role: UserRole | null;
  shopId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const MockAuthContext = createContext<MockAuthContextType>({
  user: null,
  loading: true,
  role: null,
  shopId: null,
  signIn: async () => {},
  signOut: () => {},
  isAuthenticated: false,
});

export const useMockAuth = () => {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useMockAuth must be used within MockAuthProvider');
  return ctx;
};

const SESSION_KEY = 'bs_mock_session';

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MockUser;
        const found = MOCK_USERS.find(u => u.id === parsed.id);
        if (found) {
          setUser(found);
          setCookie('bs_session', found.id);
        }
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    setUser(found);
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    setCookie('bs_session', found.id);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    deleteCookie('bs_session');
  };

  return (
    <MockAuthContext.Provider
      value={{
        user,
        loading,
        role: user?.role ?? null,
        shopId: user?.shopId ?? null,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
};
