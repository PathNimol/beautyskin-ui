import React from 'react';
import AdminOrdersClient from '@/components/features/admin/AdminOrdersClient';
import AdminSidebar from '@/components/features/dashboard/AdminSidebar';

export default function AdminOrdersPage() {
  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <AdminOrdersClient />
      </main>
    </div>
  );
}
