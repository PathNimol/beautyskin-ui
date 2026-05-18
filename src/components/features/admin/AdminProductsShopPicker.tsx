'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useRealtimeShops } from '@/hooks/useRealtimeData';

export default function AdminProductsShopPicker() {
  const { role } = useMockAuth();
  const { shops, loading, error } = useRealtimeShops();

  if (role !== 'admin') {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">This page is for administrators.</p>
        <Link href="/login" className="text-sm font-semibold text-rose-deep mt-2 inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-admin-bg">
      <div className="mb-8 pl-10 md:pl-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Products by shop</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Choose a shop to manage its catalog: add and edit products, soft-delete and restore, categories, brands, images,
          expiry, and supplier stock receipts.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/admin/shops/${shop.id}/products`}
              className="group bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-rose transition-all flex gap-4 items-center"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-secondary shrink-0 border border-border">
                <AppImage src={shop.logo} alt={shop.logo_alt} width={56} height={56} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate group-hover:text-rose-deep transition-colors">{shop.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{shop.products_count} products</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-rose-deep">
                  <span>Manage catalog</span>
                  <Icon name="ChevronRightIcon" size={14} className="opacity-70" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
