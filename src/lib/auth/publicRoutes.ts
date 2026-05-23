/**
 * Routes reachable without a session cookie (storefront + auth pages).
 * Keep in sync with `src/middleware.ts`.
 */
const PUBLIC_EXACT = new Set([
  '/',
  '/login',
  '/oauth2/callback',
  '/register',
  '/forgot-password',
  '/product-listing',
  '/cart',
  '/checkout',
  '/customer/products',
  '/customer/shop',
  '/customer/cart',
  '/customer/checkout',
]);

const PUBLIC_PREFIXES = [
  '/product-detail/',
  '/customer/products/',
  '/customer/shop/',
];

export function isPublicRoute(pathname: string): boolean {
  if (!pathname || pathname === '/') return true;
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
