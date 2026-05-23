import React from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
