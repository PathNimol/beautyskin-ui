import React from 'react';
import InventoryClient from '@/components/features/inventory/InventoryClient';

export const metadata = { title: 'Inventory — BS Admin' };

export default function AdminInventoryPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 pl-10 md:pl-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Platform Inventory
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Stock levels across all shops
        </p>
      </div>
      <InventoryClient platformWide />
    </div>
  );
}
