'use client';
import React, { useState, useMemo } from 'react';

import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useRealtimeOrders } from '@/hooks/useRealtimeData';
import type { DbOrder } from '@/hooks/useRealtimeData';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'Pending' | 'Confirmed' | 'Packing' | 'Shipping' | 'Delivered' | 'Cancelled' | 'Returned';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  Pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  Confirmed: { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Packing: { label: 'Packing', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Shipping: { label: 'Shipping', bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  Delivered: { label: 'Delivered', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  Cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  Returned: { label: 'Returned', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  // Legacy statuses from old mock data
  Paid: { label: 'Paid', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Processing: { label: 'Processing', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Completed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  Paid: { bg: 'bg-green-50', text: 'text-green-700' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Refunded: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered', 'Cancelled', 'Returned'];

function exportOrdersCSV(orders: DbOrder[]) {
  const headers = ['Order ID', 'Customer', 'Email', 'Shop', 'Total ($)', 'Status', 'Payment Method', 'Payment Status', 'Date'];
  const rows = orders.map((o) => [
    o.order_ref, o.customer_name, o.customer_email, o.shop_name,
    Number(o.total).toFixed(2), o.order_status, o.payment_method, o.pay_status,
    new Date(o.created_at).toLocaleDateString(),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'orders-export.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersClient() {
  const { orders, loading, error, stats, updateOrderStatus, bulkUpdateStatus } = useRealtimeOrders();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
  const [filterShop, setFilterShop] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailOrder, setDetailOrder] = useState<DbOrder | null>(null);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('Confirmed');
  const [bulkSuccess, setBulkSuccess] = useState('');

  const shops = useMemo(() => ['All', ...Array.from(new Set(orders.map((o) => o.shop_name)))], [orders]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (filterStatus !== 'All') list = list.filter((o) => o.order_status === filterStatus);
    if (filterShop !== 'All') list = list.filter((o) => o.shop_name === filterShop);
    if (searchQuery) list = list.filter((o) =>
      o.order_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return list;
  }, [orders, filterStatus, filterShop, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((o) => o.id));
  };

  const applyBulkStatus = async () => {
    const success = await bulkUpdateStatus(selectedIds, bulkStatus);
    if (success) {
      setBulkSuccess(`Updated ${selectedIds.length} order(s) to "${bulkStatus}"`);
      setSelectedIds([]);
      setTimeout(() => setBulkSuccess(''), 3000);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status);
    if (detailOrder?.id === id) {
      setDetailOrder(prev => prev ? { ...prev, order_status: status } : null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading live orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
          <Icon name="ExclamationTriangleIcon" size={32} className="text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-700 mb-1">Failed to load orders</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-admin-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pl-10 md:pl-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Order Management</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-[10px] font-bold text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time order tracking across all shops</p>
        </div>
        <button
          onClick={() => exportOrdersCSV(filtered)}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl hover:bg-green-100 transition-all">
          <Icon name="TableCellsIcon" size={16} />
          Export CSV
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: stats.total, icon: 'ClipboardDocumentListIcon', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending', value: stats.pending, icon: 'ClockIcon', color: 'bg-amber-50 text-amber-600' },
          { label: 'In Progress', value: stats.processing, icon: 'ArrowPathIcon', color: 'bg-purple-50 text-purple-600' },
          { label: 'Delivered', value: stats.completed, icon: 'CheckCircleIcon', color: 'bg-green-50 text-green-600' },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: 'CurrencyDollarIcon', color: 'bg-primary/20 text-rose-deep' },
        ].map((kpi) => (
          <div key={kpi.label} className="admin-glass rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={17} />
            </div>
            <p className="text-xl font-extrabold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'All')}
              className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer">
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={filterShop} onChange={(e) => setFilterShop(e.target.value)}
              className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer">
              {shops.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl px-5 py-3.5 mb-5 flex flex-wrap items-center gap-4">
          <span className="text-sm font-bold text-foreground">{selectedIds.length} order(s) selected</span>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
              className="px-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer">
              {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button onClick={applyBulkStatus}
              className="px-4 py-2 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all">
              Apply Status
            </button>
            <button onClick={() => setSelectedIds([])}
              className="px-4 py-2 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all">
              Deselect All
            </button>
          </div>
        </div>
      )}

      {bulkSuccess && (
        <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <Icon name="CheckCircleIcon" size={16} className="text-green-600" />
          <span className="text-sm font-semibold text-green-700">{bulkSuccess}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <p className="text-sm font-bold text-foreground">{filtered.length} orders</p>
          <button onClick={() => exportOrdersCSV(filtered)} className="sm:hidden flex items-center gap-1.5 text-xs font-semibold text-green-700">
            <Icon name="TableCellsIcon" size={14} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll} className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Shop</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Payment</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const sc = STATUS_CONFIG[order.order_status] || STATUS_CONFIG['Pending'];
                const pc = PAYMENT_STATUS_CONFIG[order.pay_status] || PAYMENT_STATUS_CONFIG['Pending'];
                return (
                  <tr key={order.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${selectedIds.includes(order.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelect(order.id)}
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-foreground font-mono">{order.order_ref}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-border shrink-0">
                          <AppImage src={order.customer_avatar} alt={order.customer_avatar_alt} width={28} height={28} className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-foreground whitespace-nowrap">{order.customer_name}</span>
                          <p className="text-[10px] text-muted-foreground">{order.customer_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{order.shop_name}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-bold text-foreground">${Number(order.total).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center hidden md:table-cell">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${pc.bg} ${pc.text}`}>
                        {order.pay_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => setDetailOrder(order)}
                        className="px-3 py-1.5 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-border transition-all min-h-[32px]">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Icon name="ClipboardDocumentListIcon" size={36} className="text-border mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No orders found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setDetailOrder(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h2 className="font-bold text-foreground">{detailOrder.order_ref}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(detailOrder.created_at).toLocaleDateString()} · {detailOrder.shop_name}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Customer Info</p>
                <div className="flex items-center gap-3 p-4 bg-secondary/40 rounded-xl">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                    <AppImage src={detailOrder.customer_avatar} alt={detailOrder.customer_avatar_alt} width={40} height={40} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{detailOrder.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{detailOrder.customer_email}</p>
                    <p className="text-xs text-muted-foreground">{detailOrder.customer_phone}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                  <Icon name="MapPinIcon" size={13} className="shrink-0 mt-0.5" />
                  <span>{detailOrder.address}, {detailOrder.city}, {detailOrder.country}</span>
                </div>
              </div>

              {/* Products */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Order Items</p>
                <div className="space-y-2">
                  {(detailOrder.items || []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {p.qty} × ${Number(p.price).toFixed(2)}</p>
                      </div>
                      <span className="text-sm font-bold text-foreground">${(p.qty * Number(p.price)).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
                    <span className="text-sm font-bold text-foreground">Total</span>
                    <span className="text-base font-extrabold text-foreground">${Number(detailOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Payment Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/40 rounded-xl">
                    <p className="text-[10px] text-muted-foreground">Method</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{detailOrder.payment_method}</p>
                  </div>
                  <div className="p-3 bg-secondary/40 rounded-xl">
                    <p className="text-[10px] text-muted-foreground">Status</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold mt-0.5 ${PAYMENT_STATUS_CONFIG[detailOrder.pay_status]?.bg || ''} ${PAYMENT_STATUS_CONFIG[detailOrder.pay_status]?.text || ''}`}>
                      {detailOrder.pay_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map((s) => {
                    const sc = STATUS_CONFIG[s];
                    return (
                      <button key={s} onClick={() => handleUpdateOrderStatus(detailOrder.id, s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${detailOrder.order_status === s ? `${sc.bg} ${sc.text} border-current` : 'bg-secondary text-muted-foreground border-transparent hover:bg-border'}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
