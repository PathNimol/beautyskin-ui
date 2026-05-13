import React from 'react';
import AdminSidebar from '../admin-dashboard/components/AdminSidebar';
import ShopManagementClient from './components/ShopManagementClient';

export default function AdminShopsPage() {
  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <ShopManagementClient />
      </main>
    </div>
  );
}
