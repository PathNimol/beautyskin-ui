'use client';

import React from 'react';
import NavigationProgress from '@/components/ui/NavigationProgress';
import { MockAuthProvider } from '@/contexts/MockAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import CartFloatingIndicator from '@/components/cart/CartFloatingIndicator';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MockAuthProvider>
      <CartProvider>
        <NavigationProgress />
        <CartFloatingIndicator />
        {children}
      </CartProvider>
    </MockAuthProvider>
  );
}
