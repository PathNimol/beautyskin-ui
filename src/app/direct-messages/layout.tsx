import React from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function DirectMessagesLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
