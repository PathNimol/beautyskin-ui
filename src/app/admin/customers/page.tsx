// /app/admin/customers/page.tsx
// Replaces the old broken shell that imported from @/app/customers/CustomersClient

import React from 'react';
import AdminSidebar from '@/components/features/dashboard/AdminSidebar';
import CustomersClient from '@/app/customers/CustomersClient';

export const metadata = { title: 'Customers — BS Admin' };

export default function AdminCustomersPage() {
  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <CustomersClient />
      </main>
    </div>
  );
}
