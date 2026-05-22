'use client';

import React from 'react';
import NavigationProgress from '@/components/ui/NavigationProgress';
import { MockAuthProvider } from '@/contexts/MockAuthContext';
import { CartProvider } from '@/contexts/CartContext';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MockAuthProvider>
      <CartProvider>
        <NavigationProgress />
        {children}
      </CartProvider>
    </MockAuthProvider>
  );
}
