'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';
import { getCartHref } from '@/lib/cart/cartPaths';

function isCartRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/cart' || pathname === '/customer/cart' || pathname.endsWith('/checkout');
}

export default function CartFloatingIndicator() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const cartHref = getCartHref(pathname);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 500);
      prevCount.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  if (itemCount <= 0 || isCartRoute(pathname)) {
    return null;
  }

  const label = itemCount === 1 ? '1 item in cart' : `${itemCount} items in cart`;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100]">
      <Link
        href={cartHref}
        aria-label={label}
        className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-border bg-card py-2.5 pl-3 pr-4 shadow-lg ring-1 ring-black/5 transition-transform hover:bg-secondary/50 ${
          bump ? 'scale-105' : 'scale-100'
        }`}
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
          <Icon name="ShoppingBagIcon" size={20} className="text-rose-deep" />
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-deep px-1 text-[11px] font-bold text-white">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        </span>
        <span className="text-sm font-bold text-foreground">View cart</span>
      </Link>
    </div>
  );
}
