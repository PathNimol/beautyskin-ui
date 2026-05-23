'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/features/dashboard/AdminSidebar';
import { useMockAuth } from '@/contexts/MockAuthContext';

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useMockAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const dest = encodeURIComponent(pathname || '/admin/dashboard');
      router.replace(`/login?redirect=${dest}`);
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-admin-bg items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen bg-admin-bg items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
