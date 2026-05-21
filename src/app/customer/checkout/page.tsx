import React from 'react';
import CheckoutClient from '@/app/checkout/components/CheckoutClient';
import DashboardLayout from '@/components/DashboardLayout';

export const metadata = {
  title: 'Checkout — BS Online Shop',
};

export default function CustomerCheckoutPage() {
  return (
    <DashboardLayout title="Checkout" subtitle="Complete your order">
      <CheckoutClient embedded />
    </DashboardLayout>
  );
}
