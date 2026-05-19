'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useRealtimeOrders } from '@/hooks/useRealtimeData';
import { mapApiOrderToMock } from '@/lib/api/mappers';
import type { Order } from '@/lib/mock/data';
import { useMockAuth } from '@/contexts/MockAuthContext';

type OrderStatus = Order['status'];

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  Confirmed: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  Packing: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Shipping: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Delivered: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  Returned: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered', 'Cancelled', 'Returned'];

const ORDER_TIMELINE: Record<OrderStatus, { step: number; label: string }> = {
  Pending: { step: 1, label: 'Order Placed' },
  Confirmed: { step: 2, label: 'Confirmed' },
  Packing: { step: 3, label: 'Packing' },
  Shipping: { step: 4, label: 'Shipped' },
  Delivered: { step: 5, label: 'Delivered' },
  Cancelled: { step: 0, label: 'Cancelled' },
  Returned: { step: 0, label: 'Returned' },
};

function dbOrderToMock(o: ReturnType<typeof useRealtimeOrders>['orders'][0]): Order {
  return mapApiOrderToMock({
    id: o.id,
    orderRef: o.order_ref,
    customerId: o.customer_id,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    shopId: o.shop_id,
    shopName: o.shop_name,
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    total: o.total,
    subtotal: o.subtotal,
    shipping: o.shipping,
    discount: o.discount,
    status: o.order_status.toUpperCase(),
    paymentMethod: o.payment_method,
    paymentStatus: o.pay_status.toUpperCase(),
    address: o.address,
    city: o.city,
    country: o.country,
    trackingNumber: o.tracking_number,
    notes: o.notes,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  });
}

export default function OrdersClient() {
  const { shopId } = useMockAuth();
  const { orders: dbOrders, loading, error, updateOrderStatus, bulkUpdateStatus, refetch } = useRealtimeOrders(shopId ?? undefined);
  const orders = useMemo(() => dbOrders.map(dbOrderToMock), [dbOrders]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('Confirmed');
  const [successMsg, setSuccessMsg] = useState('');

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    shipping: orders.filter(o => o.status === 'Shipping').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.total, 0),
  };

  const toggleSelect = (id: string) => {
    const dbId = dbOrders.find((d) => d.order_ref === id || d.id === id)?.id ?? id;
    setSelectedIds(prev => prev.includes(dbId) ? prev.filter(x => x !== dbId) : [...prev, dbId]);
  };

  const applyBulkStatus = async () => {
    const ok = await bulkUpdateStatus(selectedIds, bulkStatus);
    if (ok) {
      setSuccessMsg(`Updated ${selectedIds.length} orders to ${bulkStatus}`);
      setSelectedIds([]);
      setTimeout(() => setSuccessMsg(''), 3000);
      refetch();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const dbOrder = dbOrders.find((d) => d.order_ref === orderId || d.id === orderId);
    if (!dbOrder) return;
    await updateOrderStatus(dbOrder.id, status);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
    refetch();
  };

  if (loading && orders.length === 0) {
    return (
      <DashboardLayout title="Orders" subtitle="Loading orders...">
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Orders" subtitle={`${orders.length} total orders`}>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</motion.div>
      )}
      {/* Stats */}
      <motion.div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">