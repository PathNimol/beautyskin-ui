'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useRealtimeInventory } from '@/hooks/useRealtimeData';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  healthy: { bg: 'bg-green-50', text: 'text-green-700', label: 'Healthy' },
  low: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Low Stock' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', label: 'Critical' },
  out_of_stock: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Out of Stock' },
  expiring_soon: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Expiring Soon' },
  expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
};

interface InventoryClientProps {
  /** When true and user is admin, loads platform-wide inventory (no shopId). */
  platformWide?: boolean;
}

export default function InventoryClient({ platformWide = false }: InventoryClientProps) {
  const { inventory, loading, error, stats, lowStockAlerts, restockItem } = useRealtimeInventory(
    undefined,
    platformWide
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [restockModal, setRestockModal] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockSuccess, setRestockSuccess] = useState('');
  const [restockLoading, setRestockLoading] = useState(false);

  const filtered = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = item.product_name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.inv_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [inventory, search, statusFilter]);

  const handleRestock = async () => {
    if (!restockModal || !restockQty) return;
    setRestockLoading(true);
    const qty = parseInt(restockQty);
    const success = await restockItem(restockModal, qty);
    setRestockLoading(false);
    if (success) {
      setRestockSuccess(`Successfully restocked ${restockQty} units`);
      setRestockModal(null);
      setRestockQty('');
      setTimeout(() => setRestockSuccess(''), 3000);
    }
  };

  if (loading) {
    return (
      <><div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Loading live inventory...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <><div className="flex items-center justify-center py-24">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
            <Icon name="ExclamationTriangleIcon" size={32} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-red-700 mb-1">Failed to load inventory</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>{/* Live indicator */}
      <div className="flex items-center gap-2 mb-5">
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-[10px] font-bold text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live Sync Active
        </span>
        {lowStockAlerts.length > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-[10px] font-bold text-red-700">
            <Icon name="ExclamationTriangleIcon" size={11} />
            {lowStockAlerts.length} low-stock alert{lowStockAlerts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Items', value: stats.total, icon: 'CubeIcon', color: 'bg-blue-50 text-blue-600' },
          { label: 'Healthy', value: stats.healthy, icon: 'CheckCircleIcon', color: 'bg-green-50 text-green-600' },
          { label: 'Low Stock', value: stats.lowStock, icon: 'ExclamationTriangleIcon', color: 'bg-amber-50 text-amber-600' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: 'XCircleIcon', color: 'bg-red-50 text-red-600' },
          { label: 'Expiring Soon', value: stats.expiring, icon: 'ClockIcon', color: 'bg-orange-50 text-orange-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={16} />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Success Toast */}
      {restockSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
          <Icon name="CheckCircleIcon" size={18} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-700 font-semibold">{restockSuccess}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all"
        >
          <option value="All">All Status</option>
          {Object.entries(STATUS_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose">
          <Icon name="ArrowDownTrayIcon" size={15} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">SKU</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Stock</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Min / Max</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden xl:table-cell">Supplier</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Expiry</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
                        <Icon name="CubeIcon" size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No inventory items found</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(item => {
                const stockPercent = Math.min(100, (item.current_stock / item.max_stock) * 100);
                const statusStyle = STATUS_STYLES[item.inv_status] || STATUS_STYLES['healthy'];
                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-foreground leading-snug max-w-[200px] truncate">{item.product_name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Batch: {item.batch_number}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">{item.sku}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-sm font-bold ${item.current_stock === 0 ? 'text-red-600' : item.current_stock < item.min_stock ? 'text-amber-600' : 'text-foreground'}`}>
                          {item.current_stock}
                        </span>
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${stockPercent < 20 ? 'bg-red-400' : stockPercent < 50 ? 'bg-amber-400' : 'bg-green-400'}`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{item.min_stock} / {item.max_stock}</span>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <span className="text-xs text-muted-foreground">{item.supplier_name}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{item.expiry_date}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setRestockModal(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-rose-deep text-xs font-bold rounded-lg hover:bg-primary/20 transition-all mx-auto"
                      >
                        <Icon name="ArrowUpIcon" size={11} />
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setRestockModal(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-bold text-foreground mb-1">Restock Product</h3>
            <p className="text-xs text-muted-foreground mb-5">
              {inventory.find(i => i.id === restockModal)?.product_name}
            </p>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Quantity to Add</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={e => setRestockQty(e.target.value)}
                placeholder="Enter quantity"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRestock}
                disabled={!restockQty || parseInt(restockQty) < 1 || restockLoading}
                className="flex-1 py-2.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {restockLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Confirm Restock
              </button>
              <button onClick={() => setRestockModal(null)} className="px-4 py-2.5 bg-secondary text-muted-foreground font-semibold rounded-xl hover:text-foreground transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
