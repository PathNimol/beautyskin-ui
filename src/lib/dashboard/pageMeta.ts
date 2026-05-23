export type DashboardPageMeta = {
  title: string;
  subtitle?: string;
};

const EXACT: Record<string, DashboardPageMeta> = {
  '/customer/account': {
    title: 'My Account',
    subtitle: 'Profile and shipping details for faster checkout',
  },
  '/customer/products': {
    title: 'All Products',
    subtitle: 'Browse skincare from every shop on the platform',
  },
  '/customer/cart': { title: 'Cart', subtitle: 'Review items before checkout' },
  '/customer/checkout': { title: 'Checkout', subtitle: 'Complete your order' },
  '/customer/shop': { title: 'Shop', subtitle: 'Browse skincare from every shop on the platform' },
  '/customer/chat': { title: 'Chat', subtitle: 'Real-time messaging' },
  '/customer/direct-messages': {
    title: 'Direct Messages',
    subtitle: 'Private one-to-one messaging',
  },
  '/owner/dashboard': { title: 'Shop Dashboard', subtitle: 'Shop overview and key metrics' },
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview and key metrics' },
  '/owner/products': { title: 'Products', subtitle: 'Manage your product catalog' },
  '/owner/inventory': { title: 'Inventory', subtitle: 'Track and manage stock levels' },
  '/owner/orders': { title: 'Orders', subtitle: 'View and fulfill customer orders' },
  '/owner/pos': { title: 'POS System', subtitle: 'Point of sale for in-store sales' },
  '/owner/staff': { title: 'Staff', subtitle: 'Manage shop staff accounts' },
  '/owner/suppliers': { title: 'Suppliers', subtitle: 'Supplier contacts and terms' },
  '/owner/purchases': { title: 'Purchases', subtitle: 'Supplier purchase orders' },
  '/owner/customers': { title: 'Customers', subtitle: 'Your shop customers' },
  '/owner/promotions': { title: 'Promotions', subtitle: 'Coupons and discounts' },
  '/owner/reports': { title: 'Reports', subtitle: 'Analytics and business insights' },
  '/owner/analytics': { title: 'Analytics', subtitle: 'Shop performance insights' },
  '/staff/dashboard': { title: 'Dashboard', subtitle: 'Daily shop overview' },
  '/staff/products': { title: 'Products', subtitle: 'Browse and manage products' },
  '/staff/inventory': { title: 'Inventory', subtitle: 'Stock levels and adjustments' },
  '/staff/orders': { title: 'Orders', subtitle: 'Process customer orders' },
  '/staff/pos': { title: 'POS System', subtitle: 'In-store checkout' },
  '/staff/revoke-requests': {
    title: 'Revoke Requests',
    subtitle: 'Request removal of expired or tester products',
  },
  '/chat': { title: 'Chat', subtitle: 'Real-time messaging for all roles' },
  '/direct-messages': { title: 'Direct Messages', subtitle: 'Private one-to-one messaging' },
  '/settings': { title: 'Settings', subtitle: 'Platform and account preferences' },
};

const PREFIX: { prefix: string; meta: DashboardPageMeta }[] = [
  {
    prefix: '/customer/products/',
    meta: { title: 'Product Detail', subtitle: 'Product information' },
  },
  {
    prefix: '/product-detail/',
    meta: { title: 'Product Detail', subtitle: 'Product information' },
  },
];

export function getDashboardPageMeta(pathname: string): DashboardPageMeta {
  if (EXACT[pathname]) return EXACT[pathname];
  const match = PREFIX.find((p) => pathname.startsWith(p.prefix));
  if (match) return match.meta;
  const segment = pathname.split('/').filter(Boolean).pop();
  const title = segment
    ? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Dashboard';
  return { title, subtitle: undefined };
}
