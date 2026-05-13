import React from 'react';
import AdminOrdersClient from '@/app/admin-orders/components/AdminOrdersClient';
import AdminSidebar from '@/app/admin-dashboard/components/AdminSidebar';

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
