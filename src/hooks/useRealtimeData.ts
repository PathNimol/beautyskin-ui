'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────
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
  order_status: 'Pending' | 'Confirmed' | 'Packing' | 'Shipping' | 'Delivered' | 'Cancelled' | 'Returned';
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
  type: 'new_order' | 'low_stock' | 'expiry_alert' | 'promotion' | 'review' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── useRealtimeInventory ─────────────────────────────────────────────────────
export function useRealtimeInventory() {
  const [inventory, setInventory] = useState<DbInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .order('product_name', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setInventory((data as DbInventoryItem[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  const restockItem = useCallback(async (itemId: string, qty: number) => {
    const supabase = createClient();
    const item = inventory.find(i => i.id === itemId);
    if (!item) return false;

    const newStock = item.current_stock + qty;
    let newStatus: DbInventoryItem['inv_status'] = 'healthy';
    if (newStock === 0) newStatus = 'out_of_stock';
    else if (newStock < item.min_stock) newStatus = 'critical';
    else if (newStock < item.reorder_point) newStatus = 'low';

    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ current_stock: newStock, inv_status: newStatus, last_restocked: new Date().toISOString() })
      .eq('id', itemId);

    if (updateError) {
      setError(updateError.message);
      return false;
    }
    return true;
  }, [inventory]);

  useEffect(() => {
    fetchInventory();

    const supabase = createClient();
    const channel = supabase
      .channel('inventory_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setInventory(prev => [...prev, payload.new as DbInventoryItem]);
          } else if (payload.eventType === 'UPDATE') {
            setInventory(prev =>
              prev.map(item => item.id === payload.new.id ? (payload.new as DbInventoryItem) : item)
            );
          } else if (payload.eventType === 'DELETE') {
            setInventory(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInventory]);

  const lowStockAlerts = inventory.filter(
    i => i.inv_status === 'critical' || i.inv_status === 'low' || i.inv_status === 'out_of_stock'
  );

  const stats = {
    total: inventory.length,
    healthy: inventory.filter(i => i.inv_status === 'healthy').length,
    lowStock: inventory.filter(i => i.inv_status === 'low' || i.inv_status === 'critical').length,
    outOfStock: inventory.filter(i => i.inv_status === 'out_of_stock').length,
    expiring: inventory.filter(i => i.inv_status === 'expiring_soon').length,
  };

  return { inventory, loading, error, stats, lowStockAlerts, restockItem, refetch: fetchInventory };
}

// ─── useRealtimeOrders ────────────────────────────────────────────────────────
export function useRealtimeOrders() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setOrders((data as DbOrder[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: DbOrder['order_status']) => {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId);

    if (updateError) {
      setError(updateError.message);
      return false;
    }
    return true;
  }, []);

  const bulkUpdateStatus = useCallback(async (orderIds: string[], status: DbOrder['order_status']) => {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('orders')
      .update({ order_status: status })
      .in('id', orderIds);

    if (updateError) {
      setError(updateError.message);
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    fetchOrders();

    const supabase = createClient();
    const channel = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as DbOrder, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev =>
              prev.map(order => order.id === payload.new.id ? (payload.new as DbOrder) : order)
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'Pending').length,
    processing: orders.filter(o => ['Confirmed', 'Packing'].includes(o.order_status)).length,
    completed: orders.filter(o => o.order_status === 'Delivered').length,
    revenue: orders.filter(o => o.pay_status === 'Paid').reduce((s, o) => s + Number(o.total), 0),
  };

  return { orders, loading, error, stats, updateOrderStatus, bulkUpdateStatus, refetch: fetchOrders };
}

// ─── useRealtimeShops ─────────────────────────────────────────────────────────
export function useRealtimeShops() {
  const [shops, setShops] = useState<DbShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error: fetchError } = await supabase
        .from('shops')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setShops((data as DbShop[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();

    const supabase = createClient();
    const channel = supabase
      .channel('shops_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shops' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setShops(prev => [...prev, payload.new as DbShop]);
          } else if (payload.eventType === 'UPDATE') {
            setShops(prev =>
              prev.map(shop => shop.id === payload.new.id ? (payload.new as DbShop) : shop)
            );
          } else if (payload.eventType === 'DELETE') {
            setShops(prev => prev.filter(shop => shop.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchShops]);

  return { shops, loading, error, refetch: fetchShops };
}

// ─── useRealtimeStaff ─────────────────────────────────────────────────────────
export function useRealtimeStaff(shopId?: string) {
  const [staff, setStaff] = useState<DbStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);

  const fetchStaff = useCallback(async () => {
    const supabase = createClient();
    try {
      let query = supabase.from('staff').select('*').order('created_at', { ascending: true });
      if (shopId) query = query.eq('shop_id', shopId);
      const { data, error: fetchError } = await query;
      if (fetchError) { setError(fetchError.message); return; }
      setStaff((data as DbStaff[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const batchInsertStaff = useCallback(async (
    rows: Omit<DbStaff, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<{ inserted: number; errors: string[] }> => {
    const supabase = createClient();
    setInserting(true);
    const errors: string[] = [];
    let inserted = 0;

    // Batch in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error: insertError } = await supabase.from('staff').insert(chunk);
      if (insertError) {
        errors.push(`Batch ${Math.floor(i / chunkSize) + 1}: ${insertError.message}`);
      } else {
        inserted += chunk.length;
      }
    }

    setInserting(false);
    return { inserted, errors };
  }, []);

  const removeStaffMember = useCallback(async (staffId: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('staff').delete().eq('id', staffId);
    if (deleteError) { setError(deleteError.message); return false; }
    return true;
  }, []);

  const updateStaffRole = useCallback(async (staffId: string, role: DbStaff['role']) => {
    const supabase = createClient();
    const { error: updateError } = await supabase.from('staff').update({ role }).eq('id', staffId);
    if (updateError) { setError(updateError.message); return false; }
    return true;
  }, []);

  useEffect(() => {
    fetchStaff();
    const supabase = createClient();
    const channelName = shopId ? `staff_realtime_${shopId}` : 'staff_realtime_all';
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newStaff = payload.new as DbStaff;
          if (!shopId || newStaff.shop_id === shopId) {
            setStaff(prev => [...prev, newStaff]);
          }
        } else if (payload.eventType === 'UPDATE') {
          setStaff(prev => prev.map(s => s.id === payload.new.id ? (payload.new as DbStaff) : s));
        } else if (payload.eventType === 'DELETE') {
          setStaff(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchStaff, shopId]);

  return { staff, loading, error, inserting, batchInsertStaff, removeStaffMember, updateStaffRole, refetch: fetchStaff };
}

// ─── useRealtimeNotifications ─────────────────────────────────────────────────
export function useRealtimeNotifications(shopId?: string) {
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastQueue, setToastQueue] = useState<DbNotification[]>([]);

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (shopId) query = query.eq('shop_id', shopId);
      const { data, error: fetchError } = await query;
      if (fetchError) { setLoading(false); return; }
      setNotifications((data as DbNotification[]) || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const markAsRead = useCallback(async (notifId: string) => {
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const supabase = createClient();
    let query = supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (shopId) query = (query as any).eq('shop_id', shopId);
    await query;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [shopId]);

  const dismissToast = useCallback((notifId: string) => {
    setToastQueue(prev => prev.filter(n => n.id !== notifId));
  }, []);

  useEffect(() => {
    fetchNotifications();
    const supabase = createClient();
    const channelName = shopId ? `notifications_realtime_${shopId}` : 'notifications_realtime_all';
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const newNotif = payload.new as DbNotification;
        if (!shopId || newNotif.shop_id === shopId) {
          setNotifications(prev => [newNotif, ...prev]);
          setToastQueue(prev => [...prev, newNotif]);
          // Auto-dismiss toast after 5s
          setTimeout(() => {
            setToastQueue(prev => prev.filter(n => n.id !== newNotif.id));
          }, 5000);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications(prev => prev.map(n => n.id === payload.new.id ? (payload.new as DbNotification) : n));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications, shopId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { notifications, loading, unreadCount, toastQueue, markAsRead, markAllAsRead, dismissToast, refetch: fetchNotifications };
}
