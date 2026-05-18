import React from 'react';
import AdminSidebar from '@/components/features/dashboard/AdminSidebar';
import AdminProductManagementClient from '@/components/features/admin/AdminProductManagementClient';

interface Props {
  params: { shopId: string };
}

export function generateMetadata({ params }: Props) {
  return { title: `Shop products — ${params.shopId} — BS Admin` };
}

export default function AdminShopProductsPage({ params }: Props) {
  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <AdminProductManagementClient shopId={params.shopId} />
      </main>
    </div>
  );
}
