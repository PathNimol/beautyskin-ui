import React from 'react';
import AdminProductManagementClient from '@/components/features/admin/AdminProductManagementClient';

interface Props {
  params: Promise<{ shopId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { shopId } = await params;
  return { title: `Shop products — ${shopId} — BS Admin` };
}

export default async function AdminShopProductsPage({ params }: Props) {
  const { shopId } = await params;
  return <AdminProductManagementClient shopId={shopId} />;
}
