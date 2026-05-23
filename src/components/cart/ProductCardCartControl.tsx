'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';
import type { CatalogProduct } from '@/lib/mock/productCatalog';

type Props = {
  product: CatalogProduct;
  disabled?: boolean;
  className?: string;
};

export default function ProductCardCartControl({ product, disabled = false, className = '' }: Props) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [busy, setBusy] = useState(false);

  const line = useMemo(
    () => items.find((i) => (i.productId || i.id) === product.id),
    [items, product.id]
  );
  const qty = line?.quantity ?? 0;
  const maxQty = Math.max(1, product.stock ?? 99);
  const outOfStock = !product.inStock || product.stock === 0;

  const cartPayload = useMemo(
    () => ({
      id: product.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      alt: product.alt,
      shopId: product.shopId,
      shopName: product.shopName,
    }),
    [product]
  );

  const run = async (fn: () => Promise<void>) => {
    if (busy || disabled || outOfStock) return;
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = () =>
    run(() => addItem(cartPayload, 1));

  const handleIncrease = () =>
    run(async () => {
      if (line) {
        if (qty >= maxQty) return;
        await updateQuantity(line.id, qty + 1);
      } else {
        await addItem(cartPayload, 1);
      }
    });

  const handleDecrease = () =>
    run(async () => {
      if (!line) return;
      if (qty <= 1) await removeItem(line.id);
      else await updateQuantity(line.id, qty - 1);
    });

  const baseBtn =
    'flex min-h-[44px] items-center justify-center rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60';

  if (outOfStock || disabled) {
    return (
      <button type="button" disabled className={`${baseBtn} w-full bg-muted text-muted-foreground ${className}`}>
        Out of stock
      </button>
    );
  }

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => void handleAdd()}
        disabled={busy}
        className={`${baseBtn} w-full gap-2 bg-primary text-foreground shadow-rose hover:bg-rose-deep hover:text-white ${className}`}
      >
        {busy ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        ) : (
          <>
            <Icon name="ShoppingBagIcon" size={15} />
            Add to cart
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className={`flex min-h-[44px] w-full items-center overflow-hidden rounded-xl border border-primary/30 bg-primary/5 ${className}`}
    >
      <button
        type="button"
        onClick={() => void handleDecrease()}
        disabled={busy}
        aria-label="Decrease quantity"
        className="flex h-11 w-11 shrink-0 items-center justify-center text-foreground hover:bg-primary/15 disabled:opacity-50"
      >
        <Icon name="MinusIcon" size={16} />
      </button>
      <span className="flex flex-1 items-center justify-center text-sm font-bold tabular-nums text-foreground">
        {busy ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        ) : (
          qty
        )}
      </span>
      <button
        type="button"
        onClick={() => void handleIncrease()}
        disabled={busy || qty >= maxQty}
        aria-label="Increase quantity"
        className="flex h-11 w-11 shrink-0 items-center justify-center text-foreground hover:bg-primary/15 disabled:opacity-50"
      >
        <Icon name="PlusIcon" size={16} />
      </button>
    </div>
  );
}
