import React from 'react';
import ShopUsersClient from '@/components/features/shop/ShopUsersClient';

interface Props {
  params: Promise<{ shopId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { shopId } = await params;
  return { title: `Shop users — ${shopId} — BS Admin` };
}

export default async function ShopUsersPage({ params }: Props) {
  const { shopId } = await params;
  return <ShopUsersClient shopId={shopId} />;
}
