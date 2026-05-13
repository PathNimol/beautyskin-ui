'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { MOCK_ORDERS } from '@/lib/mock/data';
import type { Order } from '@/lib/mock/data';

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

export default function OrdersClient() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
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
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const applyBulkStatus = () => {
    setOrders(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, status: bulkStatus } : o));
    setSuccessMsg(`Updated ${selectedIds.length} orders to ${bulkStatus}`);
    setSelectedIds([]);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  return (
    <DashboardLayout title="Orders" subtitle={`${orders.length} total orders`}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: stats.total, icon: 'ClipboardDocumentListIcon', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending', value: stats.pending, icon: 'ClockIcon', color: 'bg-amber-50 text-amber-600' },
          { label: 'Shipping', value: stats.shipping, icon: 'TruckIcon', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Delivered', value: stats.delivered, icon: 'CheckCircleIcon', color: 'bg-green-50 text-green-600' },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: 'CurrencyDollarIcon', color: 'bg-primary/20 text-rose-deep' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={16} />
            </div>
            <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Success */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
          <Icon name="CheckCircleIcon" size={18} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-700 font-semibold">{successMsg}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search order ID, customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['All', ...ALL_STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as OrderStatus | 'All')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === s ? 'bg-primary text-foreground shadow-rose' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-xl mb-4 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{selectedIds.length} selected</span>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value as OrderStatus)}
            className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground focus:outline-none"
          >
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={applyBulkStatus} className="px-3 py-1.5 bg-primary text-foreground text-xs font-bold rounded-lg hover:bg-rose-deep hover:text-white transition-all">
            Apply
          </button>
          <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
            Clear
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Orders Table */}
        <div className={`bg-card border border-border rounded-2xl shadow-card overflow-hidden ${selectedOrder ? 'flex-1' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(o => o.id))} className="rounded" />
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Total</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Payment</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
                          <Icon name="ClipboardDocumentListIcon" size={24} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(order => {
                  const sc = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? 'bg-primary/5' : ''}`} onClick={() => setSelectedOrder(order)}>
                      <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelect(order.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-foreground font-mono">{order.id}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{order.createdAt}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-border shrink-0">
                            <AppImage src={order.customerAvatar} alt={order.customerAvatarAlt} width={28} height={28} className="object-cover w-full h-full" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground whitespace-nowrap">{order.customerName}</p>
                            <p className="text-[10px] text-muted-foreground hidden md:block">{order.shopName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right hidden md:table-cell">
                        <span className="text-sm font-bold text-foreground">${order.total.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center hidden lg:table-cell">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700' :
                          order.paymentStatus === 'Pending'? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="px-2 py-1 bg-secondary border border-border rounded-lg text-[10px] text-foreground focus:outline-none"
                        >
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <div className="w-80 shrink-0 bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col hidden lg:flex">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all">
                <Icon name="XMarkIcon" size={14} className="text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Order ID & Status */}
              <div>
                <p className="text-xs font-bold text-foreground font-mono">{selectedOrder.id}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{selectedOrder.createdAt}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${STATUS_CONFIG[selectedOrder.status].bg} ${STATUS_CONFIG[selectedOrder.status].text}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Order Timeline</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(step => {
                    const currentStep = ORDER_TIMELINE[selectedOrder.status]?.step || 0;
                    const isActive = step <= currentStep;
                    return (
                      <React.Fragment key={step}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${isActive ? 'bg-primary text-foreground' : 'bg-secondary text-muted-foreground'}`}>
                          {step}
                        </div>
                        {step < 5 && <div className={`flex-1 h-0.5 ${step < currentStep ? 'bg-primary' : 'bg-secondary'}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Customer */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Customer</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-border shrink-0">
                    <AppImage src={selectedOrder.customerAvatar} alt={selectedOrder.customerAvatarAlt} width={36} height={36} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{selectedOrder.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedOrder.customerEmail}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedOrder.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Items ({selectedOrder.items.length})</p>
                <div className="space-y-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.productId} className="flex items-center gap-2.5 bg-secondary rounded-xl p-2.5">
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-border shrink-0">
                        <AppImage src={item.image} alt={item.imageAlt} width={36} height={36} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">Qty: {item.qty} × ${item.price}</p>
                      </div>
                      <span className="text-xs font-bold text-foreground shrink-0">${(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-secondary rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shipping</span><span>{selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Discount</span><span>-${selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border">
                  <span>Total</span><span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Shipping Address</p>
                <p className="text-xs text-muted-foreground">{selectedOrder.address}</p>
                <p className="text-xs text-muted-foreground">{selectedOrder.city}, {selectedOrder.country}</p>
              </div>

              {selectedOrder.trackingNumber && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Tracking</p>
                  <p className="text-xs font-mono font-semibold text-foreground">{selectedOrder.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
