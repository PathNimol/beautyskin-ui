'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { ApiError } from '@/lib/api/client';
import DashboardContentSkeleton from '@/components/ui/DashboardContentSkeleton';

const GUEST_PROMO_CODES: Record<string, { discount: number; type: 'percent' | 'fixed'; label: string }> = {
  BEAUTY10: { discount: 10, type: 'percent', label: '10% off your order' },
  SKIN20: { discount: 20, type: 'percent', label: '20% off your order' },
  SAVE5: { discount: 5, type: 'fixed', label: '$5 off your order' },
  WELCOME15: { discount: 15, type: 'percent', label: '15% off for new customers' },
};

export default function CartClient({ embedded = false }: { embedded?: boolean }) {
  const shopHref = embedded ? '/customer/products' : '/product-listing';
  const checkoutHref = embedded ? '/customer/checkout' : '/checkout';
  const { isAuthenticated } = useMockAuth();
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    appliedPromoCode,
    applyPromo,
    removePromo,
    loading,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [guestPromo, setGuestPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [removedId, setRemovedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const activePromo = isAuthenticated ? appliedPromoCode : guestPromo;

  const guestPromoDiscount =
    !isAuthenticated && guestPromo && GUEST_PROMO_CODES[guestPromo]
      ? GUEST_PROMO_CODES[guestPromo].type === 'percent'
        ? subtotal * (GUEST_PROMO_CODES[guestPromo].discount / 100)
        : GUEST_PROMO_CODES[guestPromo].discount
      : 0;

  const promoDiscount = isAuthenticated ? discount : guestPromoDiscount;
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal - promoDiscount + shipping;

  const handleRemove = async (id: string) => {
    setActionError(null);
    setRemovedId(id);
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      await removeItem(id);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Could not remove item. Try again.');
    } finally {
      setRemovedId(null);
    }
  };

  const handleQty = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const nextQty = item.quantity + delta;
    if (nextQty < 1) return;
    setActionError(null);
    setBusyId(id);
    try {
      await updateQuantity(id, nextQty);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Could not update quantity.');
    } finally {
      setBusyId(null);
    }
  };

  const handleApplyPromo = async () => {
    setPromoError('');
    setPromoSuccess('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (isAuthenticated) {
      try {
        await applyPromo(code);
        setPromoSuccess(`Promo applied: ${code}`);
        setPromoInput('');
      } catch (e) {
        setPromoError(e instanceof ApiError ? e.message : 'Invalid or expired promo code.');
      }
      return;
    }

    if (GUEST_PROMO_CODES[code]) {
      setGuestPromo(code);
      setPromoSuccess(`Promo applied: ${GUEST_PROMO_CODES[code].label}`);
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try BEAUTY10, SKIN20, or SAVE5.');
    }
  };

  const handleRemovePromo = async () => {
    setPromoError('');
    setPromoSuccess('');
    if (isAuthenticated) {
      try {
        await removePromo();
      } catch (e) {
        setPromoError(e instanceof ApiError ? e.message : 'Could not remove promo.');
      }
      return;
    }
    setGuestPromo(null);
  };

  if (loading && items.length === 0) {
    return <DashboardContentSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className={`max-w-7xl mx-auto px-6 text-center ${embedded ? 'py-8' : 'py-20'}`}>
        <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon name="ShoppingBagIcon" size={36} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added any products yet.</p>
        <Link
          href={shopHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
        >
          <Icon name="ArrowLeftIcon" size={16} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-6 ${embedded ? 'py-0' : 'py-10'}`}>
      {actionError && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <Icon name="ExclamationTriangleIcon" size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{actionError}</p>
          <button type="button" onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">
            <Icon name="XMarkIcon" size={16} />
          </button>
        </div>
      )}

      {!embedded && (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Shopping Cart</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-8">
            Shopping Cart{' '}
            <span className="text-muted-foreground font-normal text-xl">({items.length} items)</span>
          </h1>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-card border border-border rounded-2xl p-5 shadow-card transition-all duration-300 ${
                removedId === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                  <AppImage
                    src={item.image}
                    alt={item.alt}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{item.brand}</p>
                      <h3 className="font-bold text-foreground text-sm mt-0.5">{item.name}</h3>
                      {item.shopName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.shopName}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      disabled={busyId === item.id}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all shrink-0 disabled:opacity-50"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Icon name="TrashIcon" size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => handleQty(item.id, -1)}
                        disabled={item.quantity <= 1 || busyId === item.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground hover:bg-card transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <Icon name="MinusIcon" size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQty(item.id, 1)}
                        disabled={busyId === item.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground hover:bg-card transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Icon name="PlusIcon" size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            href={shopHref}
            className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-gold-deep transition-colors mt-2"
          >
            <Icon name="ArrowLeftIcon" size={16} />
            Continue Shopping
          </Link>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Icon name="TagIcon" size={18} className="text-accent" />
              Promo Code
            </h3>
            {activePromo ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircleIcon" size={16} className="text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-700">{activePromo}</p>
                    {!isAuthenticated && GUEST_PROMO_CODES[activePromo] && (
                      <p className="text-xs text-green-600">{GUEST_PROMO_CODES[activePromo].label}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && void handleApplyPromo()}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => void handleApplyPromo()}
                    className="px-4 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
                {promoSuccess && <p className="text-xs text-green-600 mt-2">{promoSuccess}</p>}
                <p className="text-xs text-muted-foreground mt-2">
                  {isAuthenticated ? 'Try: BEAUTY10 (from API promotions)' : 'Try: BEAUTY10, SKIN20, SAVE5'}
                </p>
              </>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-5">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                </span>
                <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              {activePromo && promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <Icon name="TagIcon" size={13} />
                    Promo ({activePromo})
                  </span>
                  <span className="font-semibold text-green-600">-${promoDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-foreground'}`}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground bg-secondary/60 rounded-lg px-3 py-2">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-extrabold text-foreground">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href={checkoutHref}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose text-sm"
            >
              <Icon name="LockClosedIcon" size={15} />
              Proceed to Checkout
            </Link>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="ShieldCheckIcon" size={13} className="text-green-500" />
                Secure checkout
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="ArrowPathIcon" size={13} className="text-blue-500" />
                Free returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
