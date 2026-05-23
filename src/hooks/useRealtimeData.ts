'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNotificationStream } from '@/hooks/useNotificationStream';
import type { ApiNotification } from '@/lib/api/types';
import {
  inventoryApi,
  ordersApi,
  shopsApi,
  notificationsApi,
  shopStaffApi,
  mapApiInventory,
  mapApiOrder,
  mapApiShop,
  mapApiNotification,
  mapOrderStatusToApi,
} from '@/lib/api';
import { useMockAuth } from '@/contexts/MockAuthContext';

export interface DbInventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  shop_id: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  last_restocked: string;
  expiry_date: string;
  batch_number: string;
  supplier_id: string;
  supplier_name: string;
  cost_price: number;
  inv_status: 'healthy' | 'low' | 'critical' | 'out_of_stock' | 'expiring_soon' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  order_ref: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_avatar: string;
  customer_avatar_alt: string;
  shop_id: string;
  shop_name: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  order_status:
    | 'Pending'
    | 'Confirmed'
    | 'Packing'
    | 'Shipping'
    | 'Delivered'
    | 'Cancelled'
    | 'Returned';
  payment_method: string;
  pay_status: 'Paid' | 'Pending' | 'Refunded';
  address: string;
  city: string;
  country: string;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbShop {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  owner_name: string;
  logo: string;
  logo_alt: string;
  description: string;
  shop_status: 'active' | 'pending' | 'suspended';
  plan: 'starter' | 'growth' | 'enterprise';
  revenue: number;
  orders_count: number;
  products_count: number;
  customers_count: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface DbStaff {
  id: string;
  shop_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Owner' | 'Manager' | 'Staff' | 'Cashier';
  avatar: string;
  avatar_alt: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface DbNotification {
  id: string;
  shop_id: string | null;
  type:
    | 'new_order'
    | 'low_stock'
    | 'expiry_alert'
    | 'promotion'
    | 'review'
    | 'system'
    | 'shop_approval'
    | 'shop_name_change';
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
export function useRealtimeInventory(shopIdOverride?: string, platformWide = false) {
  const { shopId: authShopId, role, isAuthenticated } = useMockAuth();
  const shopId =
    platformWide && role === 'admin'
      ? undefined
      : role === 'admin'
        ? shopIdOverride
        : (shopIdOverride ?? authShopId ?? undefined);
  const [inventory, setInventory] = useState<DbInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    if (!isAuthenticated) {
      setInventory([]);
      setLoading(false);
      return;
    }
    if (!shopId && !(platformWide && role === 'admin')) {
      setInventory([]);
      setLoading(false);
      return;
    }
    try {
      const page = await inventoryApi.listInventory(shopId, { limit: 200 });
      setInventory(page.content.map(mapApiInventory));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [shopId, isAuthenticated, platformWide, role]);

  const restockItem = useCallback(
    async (itemId: string, qty: number) => {
      try {
        await inventoryApi.restock(itemId, qty);
        await fetchInventory();
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Restock failed');
        return false;
      }
    },
    [fetchInventory]
  );

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, [fetchInventory]);

  const lowStockAlerts = inventory.filter(
    (i) => i.inv_status === 'critical' || i.inv_status === 'low' || i.inv_status === 'out_of_stock'
  );

  const stats = {
    total: inventory.length,
    healthy: inventory.filter((i) => i.inv_status === 'healthy').length,
    lowStock: inventory.filter((i) => i.inv_status === 'low' || i.inv_status === 'critical').length,
    outOfStock: inventory.filter((i) => i.inv_status === 'out_of_stock').length,
    expiring: inventory.filter((i) => i.inv_status === 'expiring_soon').length,
  };

  return { inventory, loading, error, stats, lowStockAlerts, restockItem, refetch: fetchInventory };
}

export function useRealtimeOrders(shopIdOverride?: string) {
  const { shopId: authShopId, role, isAuthenticated } = useMockAuth();
  const shopId = role === 'admin' ? shopIdOverride : (shopIdOverride ?? authShopId ?? undefined);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      const page = await ordersApi.listOrders({
        shopId: shopId || undefined,
        limit: 100,
      });
      setOrders(page.content.map(mapApiOrder));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [shopId, isAuthenticated]);

  const updateOrderStatus = useCallback(
    async (orderId: string, status: DbOrder['order_status']) => {
      try {
        await ordersApi.updateOrderStatus(orderId, mapOrderStatusToApi(status));
        await fetchOrders();
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Update failed');
        return false;
      }
    },
    [fetchOrders]
  );

  const bulkUpdateStatus = useCallback(
    async (orderIds: string[], status: DbOrder['order_status']) => {
      try {
        await ordersApi.bulkUpdateStatus(orderIds, mapOrderStatusToApi(status));
        await fetchOrders();
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Bulk update failed');
        return false;
      }
    },
    [fetchOrders]
  );

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.order_status === 'Pending').length,
    processing: orders.filter((o) => ['Confirmed', 'Packing'].includes(o.order_status)).length,
    completed: orders.filter((o) => o.order_status === 'Delivered').length,
    revenue: orders.filter((o) => o.pay_status === 'Paid').reduce((s, o) => s + Number(o.total), 0),
  };

  return {
    orders,
    loading,
    error,
    stats,
    updateOrderStatus,
    bulkUpdateStatus,
    refetch: fetchOrders,
  };
}

export function useRealtimeShops() {
  const { isAuthenticated } = useMockAuth();
  const [shops, setShops] = useState<DbShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    if (!isAuthenticated) {
      setShops([]);
      setLoading(false);
      return;
    }
    try {
      const page = await shopsApi.listShops({ limit: 100 });
      setShops(page.content.map(mapApiShop));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return { shops, loading, error, refetch: fetchShops };
}

/** Shop staff — uses shop users API when available */
export function useRealtimeStaff(shopId?: string) {
  const [staff, setStaff] = useState<DbStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!shopId) {
      setStaff([]);
      return;
    }
    setLoading(true);
    try {
      const page = await shopStaffApi.list(shopId, { limit: 100 });
      setStaff(
        page.content.map((u) => ({
          id: u.id,
          shop_id: shopId,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          role: (u.role.charAt(0) + u.role.slice(1).toLowerCase()) as DbStaff['role'],
          avatar: u.avatar || '',
          avatar_alt: u.avatarAlt || u.name,
          status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
          created_at: '',
          updated_at: '',
        }))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const batchInsertStaff = useCallback(
    async (rows: Array<{ name: string; email: string; phone?: string; role: string }>) => {
      if (!shopId) return { inserted: 0, errors: ['No shop'] as string[] };
      const errors: string[] = [];
      let inserted = 0;
      for (const row of rows) {
        try {
          await shopStaffApi.create(shopId, {
            name: row.name,
            email: row.email,
            phone: row.phone,
            role: row.role.toUpperCase(),
          });
          inserted++;
        } catch (e) {
          errors.push(e instanceof Error ? e.message : 'Insert failed');
        }
      }
      await fetchStaff();
      return { inserted, errors };
    },
    [shopId, fetchStaff]
  );
  const removeStaffMember = useCallback(
    async (staffId: string) => {
      if (!shopId) return false;
      try {
        await shopStaffApi.remove(shopId, staffId);
        await fetchStaff();
        return true;
      } catch {
        return false;
      }
    },
    [shopId, fetchStaff]
  );
  const updateStaffRole = useCallback(
    async (staffId: string, role: DbStaff['role']) => {
      if (!shopId) return false;
      try {
        await shopStaffApi.update(shopId, staffId, { role: role.toUpperCase() });
        await fetchStaff();
        return true;
      } catch {
        return false;
      }
    },
    [shopId, fetchStaff]
  );

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return {
    staff,
    loading,
    error,
    inserting,
    batchInsertStaff,
    removeStaffMember,
    updateStaffRole,
    refetch: fetchStaff,
  };
}

/** Sync every `useRealtimeNotifications()` instance (navbar, sidebar, dashboard header). */
export function broadcastNotificationsRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('bs-notifications-refresh'));
  }
}

export function useRealtimeNotifications(shopId?: string) {
  const { isAuthenticated } = useMockAuth();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastQueue, setToastQueue] = useState<DbNotification[]>([]);

  const knownIdsRef = useRef<Set<string>>(new Set());

  const applyList = useCallback(
    (items: ReturnType<typeof mapApiNotification>[]) => {
      const filtered = shopId ? items.filter((n) => !n.shop_id || n.shop_id === shopId) : items;
      setNotifications(filtered);
      knownIdsRef.current = new Set(filtered.map((n) => n.id));
    },
    [shopId]
  );

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const page = await notificationsApi.listNotifications(1, 200);
      applyList(page.content.map(mapApiNotification));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, applyList]);

  const handleStreamNotification = useCallback(
    (raw: ApiNotification) => {
      const mapped = mapApiNotification(raw);
      if (shopId && mapped.shop_id && mapped.shop_id !== shopId) {
        return;
      }
      setNotifications((prev) => {
        if (prev.some((n) => n.id === mapped.id)) {
          return prev;
        }
        return [mapped, ...prev];
      });
      if (!knownIdsRef.current.has(mapped.id)) {
        knownIdsRef.current.add(mapped.id);
        if (!mapped.is_read) {
          setToastQueue((prev) => [mapped, ...prev].slice(0, 4));
        }
      }
    },
    [shopId]
  );

  useNotificationStream(handleStreamNotification);

  const markAsRead = useCallback(async (notifId: string) => {
    await notificationsApi.markRead(notifId);
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
    setToastQueue((prev) => prev.filter((n) => n.id !== notifId));
    broadcastNotificationsRefresh();
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setToastQueue([]);
    broadcastNotificationsRefresh();
  }, []);

  const deleteNotification = useCallback(async (notifId: string) => {
    await notificationsApi.deleteNotification(notifId);
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    setToastQueue((prev) => prev.filter((n) => n.id !== notifId));
    broadcastNotificationsRefresh();
  }, []);

  const dismissToast = useCallback((notifId: string) => {
    setToastQueue((prev) => prev.filter((n) => n.id !== notifId));
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    const onRefresh = () => void fetchNotifications();
    window.addEventListener('bs-notifications-refresh', onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('bs-notifications-refresh', onRefresh);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    loading,
    unreadCount,
    toastQueue,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissToast,
    refetch: fetchNotifications,
  };
}
