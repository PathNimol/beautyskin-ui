import React from 'react';
import ProductListingClient from '@/app/product-listing/components/ProductListingClient';
import DashboardLayout from '@/components/DashboardLayout';

export const metadata = {
  title: 'Shop — BS Online Shop',
};

export default function CustomerShopPage() {
  return (
    <DashboardLayout title="Shop" subtitle="Browse skincare from every shop on the platform">
      <ProductListingClient embedded />
    </DashboardLayout>
  );
}
