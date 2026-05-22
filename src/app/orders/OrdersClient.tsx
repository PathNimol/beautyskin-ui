'use client';

import React, { useState, useMemo } from 'react';
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

const ALL_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Packing',
  'Shipping',
  'Delivered',
  'Cancelled',
  'Returned',
];

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
  const { orders: dbOrders, loading, error, updateOrderStatus, bulkUpdateStatus, refetch } =
    useRealtimeOrders(shopId ?? undefined);
  const orders = useMemo(() => dbOrders.map(dbOrderToMock), [dbOrders]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('Confirmed');
  const [successMsg, setSuccessMsg] = useState('');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    shipping: orders.filter((o) => o.status === 'Shipping').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    revenue: orders.filter((o) => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.total, 0),
  };

  const toggleSelect = (id: string) => {
    const dbId = dbOrders.find((d) => d.order_ref === id || d.id === id)?.id ?? id;
    setSelectedIds((prev) => (prev.includes(dbId) ? prev.filter((x) => x !== dbId) : [...prev, dbId]));
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
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
    }
    refetch();
  };

  if (loading && orders.length === 0) {
    return (
      <><div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
      </>
    );
  }

  return (
    <>{error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}
      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: 'ClipboardDocumentListIcon', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending', value: stats.pending, icon: 'ClockIcon', color: 'bg-amber-50 text-amber-600' },
          { label: 'Shipping', value: stats.shipping, icon: 'TruckIcon', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Delivered', value: stats.delivered, icon: 'CheckCircleIcon', color: 'bg-green-50 text-green-600' },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: 'CurrencyDollarIcon', color: 'bg-primary/20 text-rose-deep' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${kpi.color}`}>
              <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={17} />
            </div>
            <p className="text-xl font-extrabold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-card flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Icon
            name="MagnifyingGlassIcon"
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search orders, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
          className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm"
        >
          <option value="All">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl px-5 py-3 mb-5 flex flex-wrap items-center gap-4">
          <span className="text-sm font-bold">{selectedIds.length} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
            className="px-3 py-2 bg-card border border-border rounded-xl text-sm ml-auto"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void applyBulkStatus()}
            className="px-4 py-2 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all"
          >
            Apply status
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 border-b border-border">
              <tr>
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all visible"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={() => {
                      if (selectedIds.length === filtered.length) setSelectedIds([]);
                      else setSelectedIds(filtered.map((o) => dbOrders.find((d) => d.order_ref === o.id || d.id === o.id)?.id ?? o.id));
                    }}
                  />
                </th>
                <th className="p-3 text-left font-semibold">Order</th>
                <th className="p-3 text-left font-semibold">Customer</th>
                <th className="p-3 text-left font-semibold">Total</th>
                <th className="p-3 text-left font-semibold">Status</th>
                <th className="p-3 text-left font-semibold">Payment</th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const dbId = dbOrders.find((d) => d.order_ref === o.id || d.id === o.id)?.id ?? o.id;
                const cfg = STATUS_CONFIG[o.status];
                return (
                  <tr key={o.id} className="border-b border-border hover:bg-secondary/20">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(dbId)}
                        onChange={() => toggleSelect(o.id)}
                        aria-label={`Select ${o.id}`}
                      />
                    </td>
                    <td className="p-3 font-mono text-xs">{o.id}</td>
                    <td className="p-3">
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                    </td>
                    <td className="p-3 font-semibold">${o.total.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3">{o.paymentStatus}</td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      <button type="button" onClick={() => setSelectedOrder(o)} className="text-accent font-semibold text-xs">
                        View
                      </button>
                      <select
                        value={o.status}
                        onChange={(e) => void handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-background"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">No orders match your filters.</div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} timeline={ORDER_TIMELINE} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}

function OrderDetailModal({
  order,
  timeline,
  onClose,
}: {
  order: Order;
  timeline: Record<OrderStatus, { step: number; label: string }>;
  onClose: () => void;
}) {
  const step = timeline[order.status]?.step ?? 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
      <div className="bg-card border border-border rounded-2xl shadow-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-extrabold">Order {order.id}</h3>
            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <Icon name="XMarkIcon" size={22} />
          </button>
        </div>
        {step > 0 && (
          <p className="text-xs text-muted-foreground mb-4">
            Progress: step {step} — {timeline[order.status]?.label}
          </p>
        )}
        <div className="space-y-3 text-sm">
          <p>
            <span className="font-semibold">Customer:</span> {order.customerName} ({order.customerEmail})
          </p>
          <p>
            <span className="font-semibold">Ship to:</span> {order.address}, {order.city}, {order.country}
          </p>
          <p>
            <span className="font-semibold">Payment:</span> {order.paymentMethod} — {order.paymentStatus}
          </p>
          <div>
            <p className="font-semibold mb-2">Items</p>
            <ul className="space-y-2">
              {order.items.map((i) => (
                <li key={i.name + i.productId} className="flex gap-3 items-center">
                  <AppImage src={i.image} alt={i.imageAlt} width={40} height={40} className="rounded-lg object-cover" />
                  <span className="flex-1">
                    {i.name} × {i.qty}
                  </span>
                  <span className="font-semibold">${(i.price * i.qty).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between pt-2 border-t border-border font-bold">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-3 bg-primary font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
