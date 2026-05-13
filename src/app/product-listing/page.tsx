import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductListingClient from '@/app/product-listing/components/ProductListingClient';

export default function ProductListingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <ProductListingClient />
      </div>
      <Footer />
    </main>
  );
}