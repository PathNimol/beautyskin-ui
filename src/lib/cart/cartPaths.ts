/** Cart page for storefront vs customer dashboard. */
export function getCartHref(pathname: string | null | undefined): string {
  if (pathname?.startsWith('/customer')) {
    return '/customer/cart';
  }
  return '/cart';
}
