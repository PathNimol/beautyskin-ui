import { apiFetch } from '../client';
import type { ApiCartItem, CheckoutQuote } from '../types';

export function getQuote() {
  return apiFetch<CheckoutQuote>('/checkout/quote');
}

export type { CheckoutQuote };
