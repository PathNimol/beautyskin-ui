import React from 'react';
import AdminSidebar from '@/app/admin-dashboard/components/AdminSidebar';
import AdminDashboardClient from '@/app/admin-dashboard/components/AdminDashboardClient';

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