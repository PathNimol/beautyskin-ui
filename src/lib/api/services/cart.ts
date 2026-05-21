import { apiFetch } from '../client';
import type { ApiCart } from '../types';

export function getCart() {
  return apiFetch<ApiCart>('/cart');
}

export function addToCart(productId: string, quantity = 1) {
  return apiFetch<ApiCart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return apiFetch<ApiCart>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: string) {
  return apiFetch<ApiCart>(`/cart/items/${itemId}`, { method: 'DELETE' });
}

export function clearCart() {
  return apiFetch<ApiCart>('/cart', { method: 'DELETE' });
}

export function applyPromo(code: string) {
  return apiFetch<ApiCart>('/cart/promo', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function removePromo() {
  return apiFetch<ApiCart>('/cart/promo', { method: 'DELETE' });
}
