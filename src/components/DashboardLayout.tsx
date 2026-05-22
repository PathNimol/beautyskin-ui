'use client';

import React from 'react';
import DashboardShell from '@/components/DashboardShell';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/** @deprecated Prefer segment `layout.tsx` with `DashboardShell`. Kept for pages not yet migrated. */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
