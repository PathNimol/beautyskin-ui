'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import DashboardContentSkeleton from '@/components/ui/DashboardContentSkeleton';
import { useDashboardNav } from '@/contexts/DashboardNavContext';

/** Shows a content skeleton immediately on sidebar click; clears when the new page mounts. */
export default function DashboardPageOutlet({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pendingPath, isNavigating, completeNavigation } = useDashboardNav();

  useLayoutEffect(() => {
    if (!isNavigating) return;
    if (pendingPath != null && pathname !== pendingPath) return;
    completeNavigation();
  }, [pathname, children, isNavigating, pendingPath, completeNavigation]);

  if (isNavigating) {
    return <DashboardContentSkeleton />;
  }

  return <>{children}</>;
}
