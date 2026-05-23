'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import DashboardContentSkeleton from '@/components/ui/DashboardContentSkeleton';
import { useDashboardNav } from '@/contexts/DashboardNavContext';

function pathMatchesTarget(pathname: string, target: string | null): boolean {
  if (!target) return true;
  return pathname === target || pathname.startsWith(`${target}/`);
}

/** Shows a content skeleton immediately on sidebar click; clears when the route is active. */
export default function DashboardPageOutlet({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pendingPath, isNavigating, completeNavigation } = useDashboardNav();

  useLayoutEffect(() => {
    if (!isNavigating) return;
    if (pathMatchesTarget(pathname, pendingPath)) {
      completeNavigation();
    }
  }, [pathname, isNavigating, pendingPath, completeNavigation]);

  // Never leave the shell stuck on skeleton if navigation is cancelled or slow.
  useEffect(() => {
    if (!isNavigating) return;
    const id = window.setTimeout(completeNavigation, 3000);
    return () => window.clearTimeout(id);
  }, [isNavigating, completeNavigation]);

  if (isNavigating) {
    return <DashboardContentSkeleton />;
  }

  return <>{children}</>;
}
