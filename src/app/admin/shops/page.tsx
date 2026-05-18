// /app/admin/shops/page.tsx
// Replaces the old broken shell that imported from @/app/shops/ShopsClient

import React from 'react';
import AdminSidebar from '@/components/features/dashboard/AdminSidebar';
import ShopManagementClient from '@/components/features/shop/ShopManagementClient';

export const metadata = { title: 'Shop Management — BS Admin' };

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
