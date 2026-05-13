'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  alt: string;
  quantity: number;
  category: string;
  maxStock: number;
}

const INITIAL_CART: CartItem[] = [
  { id: 1, name: 'Glow Essence Serum', brand: 'COSRX', price: 28.99, image: 'https://img.rocket.new/generatedImages/rocket_gen_img_14ffa882d-1773310521963.png', alt: 'Clear glass serum bottle with white dropper cap on soft pink background', quantity: 2, category: 'Serums', maxStock: 42 },
  { id: 2, name: 'Hydra Barrier Cream', brand: 'Laneige', price: 34.00, image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e9fd727b-1772071563202.png', alt: 'White cream jar with minimalist label on marble surface', quantity: 1, category: 'Moisturizers', maxStock: 8 },
  { id: 3, name: 'UV Shield SPF 50+', brand: 'Skin1004', price: 19.99, image: 'https://img.rocket.new/generatedImages/rocket_gen_img_121d6c73f-1772074800330.png', alt: 'White sunscreen tube with minimal packaging on light cream background', quantity: 1, category: 'Sunscreen', maxStock: 27 },
];

const PROMO_CODES: Record<string, { discount: number; type: 'percent' | 'fixed'; label: string }> = {
  'BEAUTY10': { discount: 10, type: 'percent', label: '10% off your order' },
  'SKIN20': { discount: 20, type: 'percent', label: '20% off your order' },
  'SAVE5': { discount: 5, type: 'fixed', label: '$5 off your order' },
  'WELCOME15': { discount: 15, type: 'percent', label: '15% off for new customers' },
};

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [removedId, setRemovedId] = useState<number | null>(null);
  const [stockAlert, setStockAlert] = useState<string | null>(null);

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(1, item.quantity + delta);
        // Prevent overselling — cap at maxStock
        if (newQty > item.maxStock) {
          setStockAlert(`Only ${item.maxStock} units of "${item.name}" available. Cannot add more.`);
          setTimeout(() => setStockAlert(null), 4000);
          return item;
        }
        // Warn when approaching stock limit
        if (newQty >= item.maxStock && item.maxStock <= 10) {
          setStockAlert(`You've reached the maximum available stock for "${item.name}" (${item.maxStock} units).`);
          setTimeout(() => setStockAlert(null), 4000);
        }
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeItem = (id: number) => {
    setRemovedId(id);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setRemovedId(null);
    }, 300);
  };

  const applyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoSuccess(`Promo applied: ${PROMO_CODES[code].label}`);
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try BEAUTY10, SKIN20, or SAVE5.');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoSuccess('');
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const promoDiscount = appliedPromo
    ? PROMO_CODES[appliedPromo].type === 'percent'
      ? subtotal * (PROMO_CODES[appliedPromo].discount / 100)
      : PROMO_CODES[appliedPromo].discount
    : 0;
  const total = subtotal - promoDiscount + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon name="ShoppingBagIcon" size={36} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added any products yet.</p>
        <Link href="/product-listing" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose">
          <Icon name="ArrowLeftIcon" size={16} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Stock alert banner */}
      {stockAlert && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <Icon name="ExclamationTriangleIcon" size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Stock Limit Reached</p>
            <p className="text-xs text-amber-700 mt-0.5">{stockAlert}</p>
          </div>
          <button onClick={() => setStockAlert(null)} className="ml-auto text-amber-500 hover:text-amber-700">
            <Icon name="XMarkIcon" size={16} />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Shopping Cart</span>
      </div>

      <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-8">
        Shopping Cart <span className="text-muted-foreground font-normal text-xl">({items.length} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-card border border-border rounded-2xl p-5 shadow-card transition-all duration-300 ${removedId === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                  <AppImage src={item.image} alt={item.alt} width={80} height={80} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{item.brand}</p>
                      <h3 className="font-bold text-foreground text-sm mt-0.5">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                      {/* Stock status indicator */}
                      {item.maxStock <= 10 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.maxStock <= 5 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span className={`text-[10px] font-semibold ${item.maxStock <= 5 ? 'text-red-600' : 'text-amber-600'}`}>
                            {item.maxStock <= 5 ? `Only ${item.maxStock} in stock!` : `${item.maxStock} left in stock`}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Icon name="TrashIcon" size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity with stock cap */}
                    <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground hover:bg-card transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <Icon name="MinusIcon" size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground hover:bg-card transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                        title={item.quantity >= item.maxStock ? `Max stock: ${item.maxStock}` : ''}
                      >
                        <Icon name="PlusIcon" size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <Link href="/product-listing" className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-gold-deep transition-colors mt-2">
            <Icon name="ArrowLeftIcon" size={16} />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Promo Code */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Icon name="TagIcon" size={18} className="text-accent" />
              Promo Code
            </h3>
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircleIcon" size={16} className="text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-700">{appliedPromo}</p>
                    <p className="text-xs text-green-600">{PROMO_CODES[appliedPromo].label}</p>
                  </div>
                </div>
                <button onClick={removePromo} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">Remove</button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button onClick={applyPromo} className="px-4 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all">
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
                <p className="text-xs text-muted-foreground mt-2">Try: BEAUTY10, SKIN20, SAVE5, WELCOME15</p>
              </>
            )}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-5">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <Icon name="TagIcon" size={13} />
                    Promo ({appliedPromo})
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
              href="/checkout"
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
