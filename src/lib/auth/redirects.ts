import type { UserRole } from '@/lib/mock/data';

export function getRoleHomePath(role: UserRole | string | null): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'owner':
      return '/owner/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'customer':
    case 'buyer':
      return '/customer/products';
    default:
      return '/';
  }
}

export function sanitizeRedirect(path: string | null, role: UserRole | string | null): string {
  if (!path || path === '/login' || path === '/register') {
    return getRoleHomePath(role);
  }
  // Allow returning to the marketing home page after login
  if (path === '/') {
    return '/';
  }
  return path;
}
