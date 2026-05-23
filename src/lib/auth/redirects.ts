import type { UserRole } from '@/lib/mock/data';
import { isPublicRoute } from '@/lib/auth/publicRoutes';

/** Normalize API/UI role strings (OWNER, role_owner, buyer, etc.). */
export function normalizeRoleKey(role: UserRole | string | null | undefined): string {
  if (role == null || role === '') return '';
  const r = String(role).toLowerCase().replace(/^role_/, '');
  if (r === 'buyer') return 'customer';
  return r;
}

export function getRoleHomePath(role: UserRole | string | null): string {
  switch (normalizeRoleKey(role)) {
    case 'admin':
      return '/admin/dashboard';
    case 'owner':
      return '/owner/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'customer':
      return '/customer/products';
    default:
      return '/';
  }
}

/** Merchant routes that are not under /owner|/staff|/admin but still valid for those roles. */
const MERCHANT_SHARED_PREFIXES = ['/chat', '/direct-messages', '/settings'];

export function isPathAllowedForRole(path: string, roleKey: string): boolean {
  if (path.startsWith('/admin')) return roleKey === 'admin';
  if (path.startsWith('/owner')) return roleKey === 'owner';
  if (path.startsWith('/staff')) return roleKey === 'staff';
  if (path.startsWith('/customer')) return roleKey === 'customer';
  if (MERCHANT_SHARED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return roleKey === 'admin' || roleKey === 'owner' || roleKey === 'staff';
  }
  if (isPublicRoute(path)) return true;
  return false;
}

/** Where to send the user after login / registration. */
export function resolvePostLoginPath(
  path: string | null,
  role: UserRole | string | null
): string {
  const home = getRoleHomePath(role);
  const roleKey = normalizeRoleKey(role);

  if (!path || path === '/login' || path === '/register') {
    return home;
  }

  // Marketing home — dashboard users go to their console, not storefront
  if (path === '/') {
    if (roleKey === 'admin' || roleKey === 'owner' || roleKey === 'staff') {
      return home;
    }
    if (roleKey === 'customer') {
      return '/customer/products';
    }
    return '/';
  }

  // e.g. owner with ?redirect=/admin/dashboard — must not land on admin then get sent to /
  if (!isPathAllowedForRole(path, roleKey)) {
    return home;
  }

  return path;
}

/** @deprecated Use resolvePostLoginPath */
export const sanitizeRedirect = resolvePostLoginPath;

/** Prefix a path with the role console segment (e.g. staff + pos → /staff/pos). */
export function roleScopedPath(role: UserRole | string | null, segment: string): string {
  const key = normalizeRoleKey(role);
  const path = segment.replace(/^\//, '');
  switch (key) {
    case 'admin':
      return `/admin/${path}`;
    case 'owner':
      return `/owner/${path}`;
    case 'staff':
      return `/staff/${path}`;
    default:
      return `/${path}`;
  }
}

export function isDashboardPath(path: string): boolean {
  return (
    path.startsWith('/admin/') ||
    path.startsWith('/owner/') ||
    path.startsWith('/staff/') ||
    path === '/admin/dashboard' ||
    path === '/owner/dashboard' ||
    path === '/staff/dashboard'
  );
}
