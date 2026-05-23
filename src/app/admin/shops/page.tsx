// /app/admin/shops/page.tsx
// Replaces the old broken shell that imported from @/app/shops/ShopsClient

import React from 'react';
import ShopManagementPage from '@/components/features/shop/ShopManagementPage';

export const metadata = { title: 'Shop Management — BS Admin' };

export default function AdminShopsPage() {
  return <ShopManagementPage />;
}
