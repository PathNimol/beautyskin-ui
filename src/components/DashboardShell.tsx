'use client';

import React, { useEffect, useRef } from 'react';
import DashboardPageOutlet from '@/components/dashboard/DashboardPageOutlet';
import { usePathname, useRouter } from 'next/navigation';
import DashboardSidebar from './features/dashboard/sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import OwnerRevokeAlertsBanner from '@/components/features/dashboard/OwnerRevokeAlertsBanner';
import DashboardShellSkeleton from '@/components/ui/DashboardShellSkeleton';
import { DashboardNavProvider, useDashboardNav } from '@/contexts/DashboardNavContext';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { getDashboardPageMeta } from '@/lib/dashboard/pageMeta';
import { startNavigation } from '@/lib/navigation';

interface DashboardShellProps {
  children: React.ReactNode;
}

function DashboardShellInner({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { pendingPath } = useDashboardNav();
  const displayPath = pendingPath ?? pathname;
  const { title, subtitle } = getDashboardPageMeta(displayPath);
  const { isAuthenticated, loading } = useMockAuth();
  const router = useRouter();
  const authChecked = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      startNavigation();
      router.push('/login');
    }
    if (!loading) authChecked.current = true;
  }, [loading, isAuthenticated, router]);

  // Only block the shell on the very first auth check — not on sidebar tab changes
  if (loading && !authChecked.current) {
    return <DashboardShellSkeleton title={title} />;
  }

  if (!isAuthenticated) {
    return <DashboardShellSkeleton title="Redirecting" />;
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <DashboardSidebar />
      <div className="flex-1 flex min-w-0 flex-col">
        <DashboardHeader title={title} subtitle={subtitle} />
        <main
          className="flex-1 overflow-auto px-6 pt-6 pb-14 md:px-8 md:pt-8 md:pb-20"
          data-page-content
        >
          <OwnerRevokeAlertsBanner />
          <DashboardPageOutlet>{children}</DashboardPageOutlet>
        </main>
      </div>
    </div>
  );
}

/** Persistent dashboard chrome (sidebar + header). Use in segment `layout.tsx` files. */
export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <DashboardNavProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </DashboardNavProvider>
  );
}
