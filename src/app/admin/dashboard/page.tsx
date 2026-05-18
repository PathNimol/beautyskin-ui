import React from 'react';
import AdminSidebar from '@/components/features/dashboard/AdminSidebar';
import AdminDashboardClient from '@/components/features/dashboard/AdminDashboardClient';

export const metadata = {
  title: 'Dashboard — BS Admin',
};

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">
        <AdminDashboardClient />
      </main>
    </div>
  );
}
