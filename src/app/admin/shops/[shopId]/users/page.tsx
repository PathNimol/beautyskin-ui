// /app/admin/shops/[shopId]/users/page.tsx
// Dynamic route — renders per-shop Owner + Staff user management

import React from 'react';
import AdminSidebar from '@/components/features/dashboard/AdminSidebar';
import ShopUsersClient from '@/components/features/shop/ShopUsersClient';

interface Props {
  params: { shopId: string };
}

export function generateMetadata({ params }: Props) {
  return { title: `Shop users — ${params.shopId} — BS Admin` };
}

export default function ShopUsersPage({ params }: Props) {
  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <ShopUsersClient shopId={params.shopId} />
      </main>
    </div>
  );
}
