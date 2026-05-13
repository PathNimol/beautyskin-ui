import React from 'react';
import ShopManagementClient from '@/app/admin-shops/components/ShopManagementClient';
import AdminSidebar from '@/app/admin-dashboard/components/AdminSidebar';

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
