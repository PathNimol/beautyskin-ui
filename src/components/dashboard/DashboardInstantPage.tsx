'use client';

import React, { Suspense } from 'react';
import DashboardContentSkeleton from '@/components/ui/DashboardContentSkeleton';

/** Client page wrapper: paints immediately; data loaders show their own skeletons inside. */
export default function DashboardInstantPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<DashboardContentSkeleton />}>{children}</Suspense>;
}
