'use client';

import { useEffect, useState } from 'react';
import { useMockAuth } from '@/contexts/MockAuthContext';

/** True after mount and auth session has finished initial load — safe for role-gated UI. */
export function useAuthReady(): boolean {
  const { loading } = useMockAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && !loading;
}
