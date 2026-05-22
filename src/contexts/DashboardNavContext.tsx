'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

type DashboardNavContextValue = {
  pendingPath: string | null;
  isNavigating: boolean;
  beginNavigation: (href: string) => void;
  completeNavigation: () => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const beginNavigation = useCallback((href: string) => {
    setPendingPath(href);
    setIsNavigating(true);
  }, []);

  const completeNavigation = useCallback(() => {
    setIsNavigating(false);
    setPendingPath(null);
  }, []);

  return (
    <DashboardNavContext.Provider
      value={{ pendingPath, isNavigating, beginNavigation, completeNavigation }}
    >
      {children}
    </DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext);
  if (!ctx) {
    return {
      pendingPath: null,
      isNavigating: false,
      beginNavigation: () => {},
      completeNavigation: () => {},
    };
  }
  return ctx;
}
