import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutClient from '@/app/checkout/components/CheckoutClient';

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <CheckoutClient />
      </div>
      <Footer />
    </main>
  );
}
