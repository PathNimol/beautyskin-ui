'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartApi } from '@/lib/api';
import type { ApiCart, ApiCartItem } from '@/lib/api/types';
import { useMockAuth } from '@/contexts/MockAuthContext';

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  alt: string;
  shopId?: string;
  shopName?: string;
  productId?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  discount: number;
  appliedPromoCode: string | null;
  applyPromo: (code: string) => Promise<void>;
  removePromo: () => Promise<void>;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);
const CART_KEY = 'bs_cart';

function applyCartToState(
  cart: ApiCart,
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
  setDiscount: React.Dispatch<React.SetStateAction<number>>,
  setAppliedPromoCode: React.Dispatch<React.SetStateAction<string | null>>
) {
  setItems(cart.items.map(mapApiCartItem));
  setDiscount(Number(cart.discount) || 0);
  setAppliedPromoCode(cart.appliedPromoCode ?? null);
}

function mapApiCartItem(i: ApiCartItem): CartItem {
  return {
    id: i.id,
    productId: i.productId,
    name: i.name,
    brand: i.brand,
    price: Number(i.price),
    quantity: i.quantity,
    image: i.image,
    alt: i.imageAlt,
    shopId: i.shopId,
    shopName: i.shopName,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useMockAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);

  const loadLocal = useCallback(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      loadLocal();
      return;
    }
    setLoading(true);
    try {
      const cart = await cartApi.getCart();
      applyCartToState(cart, setItems, setDiscount, setAppliedPromoCode);
    } catch {
      loadLocal();
      setDiscount(0);
      setAppliedPromoCode(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loadLocal]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, isAuthenticated]);

  const persistLocal = useCallback((next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }, []);

  const addItem = useCallback(
    async (item: Omit<CartItem, 'quantity'>, qty = 1) => {
      if (isAuthenticated && item.productId) {
        try {
          const cart = await cartApi.addToCart(item.productId, qty);
          applyCartToState(cart, setItems, setDiscount, setAppliedPromoCode);
          return;
        } catch {
          // fall through to local
        }
      }
      setItems((prev) => {
        const key = item.productId || item.id;
        const existing = prev.find((i) => (i.productId || i.id) === key);
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            (i.productId || i.id) === key ? { ...i, quantity: i.quantity + qty } : i
          );
        } else {
          next = [...prev, { ...item, id: item.id || key, quantity: qty }];
        }
        localStorage.setItem(CART_KEY, JSON.stringify(next));
        return next;
      });
    },
    [isAuthenticated]
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        try {
          const cart = await cartApi.removeCartItem(id);
          applyCartToState(cart, setItems, setDiscount, setAppliedPromoCode);
          return;
        } catch {
          // local fallback
        }
      }
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        localStorage.setItem(CART_KEY, JSON.stringify(next));
        return next;
      });
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (isAuthenticated) {
        try {
          const cart =
            quantity <= 0
              ? await cartApi.removeCartItem(id)
              : await cartApi.updateCartItem(id, quantity);
          applyCartToState(cart, setItems, setDiscount, setAppliedPromoCode);
          return;
        } catch {
          // local fallback
        }
      }
      setItems((prev) => {
        const next =
          quantity <= 0
            ? prev.filter((i) => i.id !== id)
            : prev.map((i) => (i.id === id ? { ...i, quantity } : i));
        localStorage.setItem(CART_KEY, JSON.stringify(next));
        return next;
      });
    },
    [isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clearCart();
        setItems([]);
        setDiscount(0);
        setAppliedPromoCode(null);
        return;
      } catch {
        // ignore
      }
    }
    persistLocal([]);
    setDiscount(0);
    setAppliedPromoCode(null);
  }, [isAuthenticated, persistLocal]);

  const applyPromo = useCallback(
    async (code: string) => {
      if (!isAuthenticated) {
        throw new Error('Sign in to apply a promo code');
      }
      const cart = await cartApi.applyPromo(code.trim());
      applyCartToState(cart, setItems, setDiscount, setAppliedPromoCode);
    },
    [isAuthenticated]
  );

  const removePromo = useCallback(async () => {
    if (!isAuthenticated) {
      setAppliedPromoCode(null);
      setDiscount(0);
      return;
    }
    const cart = await cartApi.removePromo();
    applyCartToState(cart, setItems, setDiscount, setAppliedPromoCode);
  }, [isAuthenticated]);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        appliedPromoCode,
        applyPromo,
        removePromo,
        loading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
