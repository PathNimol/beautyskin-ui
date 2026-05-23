import type { DbNotification } from '@/hooks/useRealtimeData';
import { normalizeRoleKey } from '@/lib/auth/redirects';
import type { UserRole } from '@/lib/mock/data';

/** App routes for notification deep-links (stored on API `link` when possible). */
export const NOTIFICATION_LINKS = {
  adminShops: '/admin/shops',
  adminShopsNameRequests: '/admin/shops?nameRequests=1',
  adminShopsPending: '/admin/shops?pending=1',
  ownerShops: '/owner/shops',
  adminOrders: '/admin/orders',
  ownerOrders: '/owner/orders',
  ownerInventory: '/owner/inventory',
  adminInventory: '/admin/inventory',
} as const;

export function resolveNotificationHref(
  n: Pick<DbNotification, 'type' | 'title' | 'message' | 'link' | 'shop_id'>,
  role: UserRole | string | null
): string | null {
  if (n.link?.startsWith('/')) {
    return n.link;
  }

  const title = n.title.toLowerCase();
  const message = n.message.toLowerCase();
  const roleKey = normalizeRoleKey(role);

  if (title.includes('name change') || message.includes('rename')) {
    if (roleKey === 'admin') return NOTIFICATION_LINKS.adminShopsNameRequests;
    if (roleKey === 'owner') return NOTIFICATION_LINKS.ownerShops;
  }

  if (
    title.includes('shop approval') ||
    title.includes('new shop') ||
    message.includes('awaiting approval') ||
    message.includes('registered')
  ) {
    if (roleKey === 'admin') return NOTIFICATION_LINKS.adminShopsPending;
    if (roleKey === 'owner') return NOTIFICATION_LINKS.ownerShops;
  }

  if (title.includes('shop approved') || title.includes('shop name')) {
    if (roleKey === 'owner') return NOTIFICATION_LINKS.ownerShops;
    if (roleKey === 'admin') return NOTIFICATION_LINKS.adminShops;
  }

  if (title.includes('shop registration rejected') || title.includes('not approved')) {
    if (roleKey === 'owner') return NOTIFICATION_LINKS.ownerShops;
  }

  if (n.type === 'new_order') {
    if (roleKey === 'admin') return NOTIFICATION_LINKS.adminOrders;
    if (roleKey === 'owner' || roleKey === 'staff') return NOTIFICATION_LINKS.ownerOrders;
  }

  if (n.type === 'low_stock' || n.type === 'expiry_alert') {
    if (roleKey === 'admin') return NOTIFICATION_LINKS.adminInventory;
    if (roleKey === 'owner' || roleKey === 'staff') return NOTIFICATION_LINKS.ownerInventory;
  }

  if (roleKey === 'admin') return '/admin/dashboard';
  if (roleKey === 'owner') return '/owner/dashboard';
  if (roleKey === 'staff') return '/staff/dashboard';
  if (roleKey === 'customer') return '/customer/products';

  return null;
}

/** When already on shops page, open the name-request modal without full navigation. */
export const OPEN_NAME_REQUESTS_EVENT = 'bs-open-name-requests';

export function dispatchOpenNameRequestsModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_NAME_REQUESTS_EVENT));
  }
}
