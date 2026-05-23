import type { DbNotification } from '@/hooks/useRealtimeData';

export const NOTIF_ICON: Record<DbNotification['type'], string> = {
  new_order: 'ShoppingBagIcon',
  low_stock: 'ExclamationTriangleIcon',
  expiry_alert: 'ClockIcon',
  promotion: 'TagIcon',
  review: 'StarIcon',
  system: 'BellIcon',
  shop_approval: 'BuildingStorefrontIcon',
  shop_name_change: 'PencilSquareIcon',
  product_revoke: 'ExclamationTriangleIcon',
};

export const NOTIF_COLOR: Record<DbNotification['type'], string> = {
  new_order: 'bg-green-50 text-green-600',
  low_stock: 'bg-red-50 text-red-500',
  expiry_alert: 'bg-amber-50 text-amber-500',
  promotion: 'bg-purple-50 text-purple-500',
  review: 'bg-blue-50 text-blue-500',
  system: 'bg-secondary text-muted-foreground',
  shop_approval: 'bg-amber-50 text-amber-600',
  shop_name_change: 'bg-violet-50 text-violet-600',
  product_revoke: 'bg-rose-50 text-rose-600',
};
