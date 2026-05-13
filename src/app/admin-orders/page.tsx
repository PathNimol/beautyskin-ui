import React from 'react';
import AdminSidebar from '../admin-dashboard/components/AdminSidebar';
import AdminOrdersClient from './components/AdminOrdersClient';

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
