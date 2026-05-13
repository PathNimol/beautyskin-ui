import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartClient from '@/app/cart/components/CartClient';

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <CartClient />
      </div>
      <Footer />
    </main>
  );
}
