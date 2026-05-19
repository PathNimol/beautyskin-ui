import React from 'react';
import ProductListingClient from '@/app/product-listing/components/ProductListingClient';
import DashboardLayout from '@/components/DashboardLayout';

export const metadata = {
  title: 'All Products — BS Online Shop',
};

export default function CustomerProductsPage() {
  return (
    <DashboardLayout title="All Products" subtitle="Browse skincare from every shop on the platform">
      <ProductListingClient embedded />
    </DashboardLayout>
  );
}
