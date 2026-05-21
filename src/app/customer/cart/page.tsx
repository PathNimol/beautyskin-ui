import React from 'react';
import CartClient from '@/app/cart/components/CartClient';
import DashboardLayout from '@/components/DashboardLayout';

export const metadata = {
  title: 'Cart — BS Online Shop',
};

export default function CustomerCartPage() {
  return (
    <DashboardLayout title="Cart" subtitle="Review items before checkout">
      <CartClient embedded />
    </DashboardLayout>
  );
}
