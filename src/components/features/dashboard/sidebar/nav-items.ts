import type { UserRole } from '@/lib/mock/data';

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
  roles: UserRole[];
  section?: string;
}

export const NAV_ITEMS: NavItem[] = [
  // Admin
  {
    label: 'Dashboard',
    icon: 'Squares2X2Icon',
    href: '/admin/dashboard',
    roles: ['admin'],
    section: 'main',
  },
  {
    label: 'All Shops',
    icon: 'BuildingStorefrontIcon',
    href: '/admin/all-shops',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'Manage Shops',
    icon: 'WrenchScrewdriverIcon',
    href: '/admin/shops',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'All Users',
    icon: 'UsersIcon',
    href: '/admin/customers',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'Analytics',
    icon: 'ChartBarIcon',
    href: '/admin/analytics',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'Platform Reports',
    icon: 'DocumentChartBarIcon',
    href: '/admin/reports',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'Orders',
    icon: 'ClipboardDocumentListIcon',
    href: '/admin/orders',
    roles: ['admin'],
    section: 'admin',
  },
  // Owner
  {
    label: 'Dashboard',
    icon: 'Squares2X2Icon',
    href: '/owner/dashboard',
    roles: ['owner'],
    section: 'main',
  },
  {
    label: 'Products',
    icon: 'ArchiveBoxIcon',
    href: '/owner/products',
    roles: ['owner'],
    section: 'shop',
  },
  {
    label: 'Inventory',
    icon: 'CubeIcon',
    href: '/owner/inventory',
    roles: ['owner'],
    section: 'shop',
  },
  {
    label: 'Orders',
    icon: 'ClipboardDocumentListIcon',
    href: '/owner/orders',
    roles: ['owner'],
    section: 'shop',
  },
  {
    label: 'POS System',
    icon: 'ComputerDesktopIcon',
    href: '/owner/pos',
    roles: ['owner'],
    section: 'shop',
  },
  {
    label: 'Shop',
    icon: 'UserGroupIcon',
    href: '/owner/shops',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Suppliers',
    icon: 'TruckIcon',
    href: '/owner/suppliers',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Purchases',
    icon: 'ShoppingCartIcon',
    href: '/owner/purchases',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Customers',
    icon: 'HeartIcon',
    href: '/owner/customers',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Promotions',
    icon: 'TagIcon',
    href: '/owner/promotions',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Reports',
    icon: 'ChartBarIcon',
    href: '/owner/reports',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Analytics',
    icon: 'PresentationChartLineIcon',
    href: '/owner/analytics',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Revoke Requests',
    icon: 'ExclamationTriangleIcon',
    href: '/owner/revoke-requests',
    roles: ['owner'],
    section: 'shop',
  },
  // Staff
  {
    label: 'Dashboard',
    icon: 'Squares2X2Icon',
    href: '/staff/dashboard',
    roles: ['staff'],
    section: 'main',
  },
  {
    label: 'Products',
    icon: 'ArchiveBoxIcon',
    href: '/staff/products',
    roles: ['staff'],
    section: 'shop',
  },
  {
    label: 'Inventory',
    icon: 'CubeIcon',
    href: '/staff/inventory',
    roles: ['staff'],
    section: 'shop',
  },
  {
    label: 'Orders',
    icon: 'ClipboardDocumentListIcon',
    href: '/staff/orders',
    roles: ['staff'],
    section: 'shop',
  },
  {
    label: 'POS System',
    icon: 'ComputerDesktopIcon',
    href: '/staff/pos',
    roles: ['staff'],
    section: 'shop',
  },
  {
    label: 'Revoke Requests',
    icon: 'ExclamationTriangleIcon',
    href: '/staff/revoke-requests',
    roles: ['staff'],
    section: 'staff',
  },
  {
    label: 'My Account',
    icon: 'UserCircleIcon',
    href: '/staff/account',
    roles: ['staff'],
    section: 'staff',
  },
  // Shared
  {
    label: 'Chat',
    icon: 'ChatBubbleLeftRightIcon',
    href: '/chat',
    roles: ['admin', 'owner', 'staff'],
    section: 'shared',
  },
  {
    label: 'Direct Messages',
    icon: 'EnvelopeIcon',
    href: '/direct-messages',
    roles: ['admin', 'owner', 'staff'],
    section: 'shared',
  },
  {
    label: 'Settings',
    icon: 'Cog6ToothIcon',
    href: '/settings',
    roles: ['admin', 'owner', 'staff'],
    section: 'shared',
  },
  // Customer
  {
    label: 'My Account',
    icon: 'UserCircleIcon',
    href: '/customer/account',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
  {
    label: 'All Products',
    icon: 'ArchiveBoxIcon',
    href: '/customer/products',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
  {
    label: 'Cart',
    icon: 'ShoppingCartIcon',
    href: '/customer/cart',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
  {
    label: 'Chat',
    icon: 'ChatBubbleLeftRightIcon',
    href: '/customer/chat',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
  {
    label: 'Direct Messages',
    icon: 'EnvelopeIcon',
    href: '/customer/direct-messages',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
];

export const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  owner: 'bg-rose-100 text-rose-700',
  staff: 'bg-blue-100 text-blue-700',
  customer: 'bg-green-100 text-green-700',
  buyer: 'bg-green-100 text-green-700',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
  owner: 'Shop Owner',
  staff: 'Staff',
  customer: 'Customer',
  buyer: 'Customer',
};

export function profileHref(role: string | null): string {
  if (!role) return '/';
  if (role === 'customer' || role === 'buyer') return '/customer/account';
  if (role === 'staff') return '/staff/account';
  if (role === 'owner') return '/settings';
  return '/admin/dashboard';
}
