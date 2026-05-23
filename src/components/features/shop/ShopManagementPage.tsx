'use client';

import React, { Suspense } from 'react';
import ShopManagementClient from './ShopManagementClient';

export default function ShopManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-muted-foreground">Loading shop management…</div>
      }
    >
      <ShopManagementClient />
    </Suspense>
  );
}
