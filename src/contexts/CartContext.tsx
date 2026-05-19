'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartApi } from '@/lib/api';
import type { ApiCartItem } from '@/lib/api/types';
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
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);
const CART_KEY = 'bs_cart';

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
      setItems(cart.items.map(mapApiCartItem));
    } catch {
      loadLocal();
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
          setItems(cart.items.map(mapApiCartItem));
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
          setItems(cart.items.map(mapApiCartItem));
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
          setItems(cart.items.map(mapApiCartItem));
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
      } catch {
        // ignore
      }
    }
    persistLocal([]);
  }, [isAuthenticated, persistLocal]);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, loading, refreshCart }}
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
