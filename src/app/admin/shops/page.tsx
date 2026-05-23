// /app/admin/shops/page.tsx
// Replaces the old broken shell that imported from @/app/shops/ShopsClient

import React from 'react';
import ShopManagementClient from '@/components/features/shop/ShopManagementClient';

export const metadata = { title: 'Shop Management — BS Admin' };

export default function AdminShopsPage() {
  return <ShopManagementClient />;
}
