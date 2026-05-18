import React from 'react';
import AdminSidebar from '@/components/features/dashboard/AdminSidebar';
import AdminProductsShopPicker from '@/components/features/admin/AdminProductsShopPicker';

export const metadata = { title: 'Products by shop — BS Admin' };

export default function AdminProductsLandingPage() {
  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <AdminProductsShopPicker />
      </main>
    </div>
  );
}
