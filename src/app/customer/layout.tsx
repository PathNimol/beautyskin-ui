import React from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
