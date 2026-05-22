'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { supplierPurchasesApi, suppliersApi, productsApi } from '@/lib/api';
import type { ApiProduct, ApiSupplier } from '@/lib/api/types';

interface PurchaseItem {
  product: string;
  sku: string;
  qty: number;
  unit_cost: number;
  total: number;
}

interface SupplierPurchase {
  id: string;
  purchase_ref: string;
  supplier_name: string;
  ordered_by_name: string;
  items: PurchaseItem[];
  total_amount: number;
  status: 'pending' | 'received' | 'partial' | 'cancelled';
  expected_date: string | null;
  received_date: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  received: 'bg-green-50 text-green-700 border-green-200',
  partial: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export default function SupplierPurchasesClient() {
  const { user, shopId } = useMockAuth();

  const [purchases, setPurchases] = useState<SupplierPurchase[]>([]);
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [merchantProducts, setMerchantProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<SupplierPurchase | null>(null);

  const [form, setForm] = useState({
    supplier_id: '',
    supplier_name: '',
    expected_date: '',
    notes: '',
    items: [{ product: '', sku: '', qty: 1, unit_cost: 0, total: 0 }] as PurchaseItem[],
  });

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const page = await supplierPurchasesApi.list(shopId);
      setPurchases(
        (page.content || []).map((p) => ({
          id: p.id,
          purchase_ref: p.id.slice(0, 8),
          supplier_name: p.supplierName || '',
          ordered_by_name: user?.name || '',
          items: (p.items || []).map((i) => ({
            product: i.productName,
            sku: '',
            qty: i.quantity,
            unit_cost: i.unitCost,
            total: i.quantity * i.unitCost,
          })),
          total_amount: Number(p.total) || 0,
          status: (p.status?.toLowerCase() || 'pending') as SupplierPurchase['status'],
          expected_date: p.expectedDate || null,
          received_date: null,
          notes: null,
          created_at: p.createdAt || '',
        }))
      );
    } catch { /* ignore */ }
    setLoading(false);
  }, [shopId, user?.name]);

  useEffect(() => {
    fetchPurchases();
    suppliersApi.listSuppliers({ limit: 100 }).then((p) => setSuppliers(p.content || [])).catch(() => {});
    if (shopId) {
      productsApi.listMerchant(shopId, { limit: 200 }).then((p) => setMerchantProducts(p.content || [])).catch(() => {});
    }
  }, [fetchPurchases, shopId]);

  const updateItem = (idx: number, field: keyof PurchaseItem, value: string | number) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === 'qty' || field === 'unit_cost') {
        items[idx].total = items[idx].qty * items[idx].unit_cost;
      }
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { product: '', sku: '', qty: 1, unit_cost: 0, total: 0 }] }));
  };

  const removeItem = (idx: number) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const totalAmount = form.items.reduce((s, i) => s + i.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_name || form.items.some(i => !i.product)) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      if (!shopId) throw new Error('Shop required');
      const created = await supplierPurchasesApi.create(shopId, {
        supplierId: form.supplier_id,
        expectedDate: form.expected_date || undefined,
        notes: form.notes || undefined,
        lines: form.items.map((i) => {
          const prod = merchantProducts.find((p) => p.name === i.product);
          return {
            productId: prod?.id,
            quantity: i.qty,
            unitCost: i.unit_cost,
          };
        }),
      });
      setSuccessMsg(`Purchase Order ${created.id.slice(0, 8)} created!`);
      setShowForm(false);
      setForm({ supplier_id: '', supplier_name: '', expected_date: '', notes: '', items: [{ product: '', sku: '', qty: 1, unit_cost: 0, total: 0 }] });
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchPurchases();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to create purchase order');
    }
    setSaving(false);
  };

  const updateStatus = async (id: string, status: SupplierPurchase['status']) => {
    try {
      await supplierPurchasesApi.updateStatus(id, status.toUpperCase());
      fetchPurchases();
    } catch { /* ignore */ }
  };

  const totalSpent = purchases.filter(p => p.status === 'received').reduce((s, p) => s + Number(p.total_amount), 0);

  return (
    <>{successMsg && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <Icon name="CheckCircleIcon" size={18} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-700 font-medium">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: purchases.length, icon: 'ClipboardDocumentListIcon', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending', value: purchases.filter(p => p.status === 'pending').length, icon: 'ClockIcon', color: 'bg-amber-50 text-amber-600' },
          { label: 'Received', value: purchases.filter(p => p.status === 'received').length, icon: 'CheckCircleIcon', color: 'bg-green-50 text-green-600' },
          { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: 'CurrencyDollarIcon', color: 'bg-primary/20 text-rose-deep' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={18} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-foreground">Purchase Orders</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground font-semibold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose text-sm"
        >
          <Icon name="PlusIcon" size={16} />
          New Purchase Order
        </button>
      </div>

      {/* New PO Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">Create Purchase Order</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Supplier *</label>
                <select
                  value={form.supplier_id}
                  onChange={e => {
                    const sup = suppliers.find(s => s.id === e.target.value);
                    setForm(prev => ({ ...prev, supplier_id: e.target.value, supplier_name: sup?.name || '' }));
                  }}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Expected Delivery</label>
                <input
                  type="date"
                  value={form.expected_date}
                  onChange={e => setForm(prev => ({ ...prev, expected_date: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground">Order Items *</label>
                <button type="button" onClick={addItem} className="text-xs text-accent font-semibold hover:text-gold-deep">+ Add Item</button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                    <select
                      value={item.product}
                      onChange={e => {
                        const prod = merchantProducts.find(p => p.name === e.target.value);
                        updateItem(idx, 'product', e.target.value);
                        if (prod) updateItem(idx, 'sku', prod.sku);
                      }}
                      className="col-span-2 px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="">Select product...</option>
                      {merchantProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                    <input
                      type="number" min="1" value={item.qty}
                      onChange={e => updateItem(idx, 'qty', Number(e.target.value))}
                      placeholder="Qty"
                      className="px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number" min="0" step="0.01" value={item.unit_cost}
                      onChange={e => updateItem(idx, 'unit_cost', Number(e.target.value))}
                      placeholder="Unit cost"
                      className="px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground">${item.total.toFixed(2)}</span>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 ml-1">
                          <Icon name="XMarkIcon" size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-sm font-extrabold text-foreground">Total: <span className="text-rose-deep">${totalAmount.toFixed(2)}</span></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                placeholder="Additional notes..."
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-secondary border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary/80 transition-all">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50 text-sm">
                {saving ? 'Creating...' : 'Create Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Purchase Orders Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Icon name="TruckIcon" size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No purchase orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  {['PO Ref', 'Supplier', 'Items', 'Total', 'Status', 'Expected', 'Ordered By', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-all cursor-pointer" onClick={() => setSelectedPurchase(selectedPurchase?.id === p.id ? null : p)}>
                    <td className="px-4 py-3 text-xs font-bold text-foreground">{p.purchase_ref}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{p.supplier_name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{Array.isArray(p.items) ? p.items.length : 0} items</td>
                    <td className="px-4 py-3 text-xs font-bold text-rose-deep">${Number(p.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.expected_date || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.ordered_by_name}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {p.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => updateStatus(p.id, 'received')} className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition-all">Mark Received</button>
                          <button onClick={() => updateStatus(p.id, 'cancelled')} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-all">Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedPurchase && (
        <div className="mt-4 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Order Details — {selectedPurchase.purchase_ref}</h3>
            <button onClick={() => setSelectedPurchase(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="XMarkIcon" size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Supplier</span><span className="font-semibold">{selectedPurchase.supplier_name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[selectedPurchase.status]}`}>{selectedPurchase.status}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ordered By</span><span className="font-semibold">{selectedPurchase.ordered_by_name}</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Expected</span><span className="font-semibold">{selectedPurchase.expected_date || '—'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Received</span><span className="font-semibold">{selectedPurchase.received_date || '—'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-extrabold text-rose-deep">${Number(selectedPurchase.total_amount).toLocaleString()}</span></div>
            </div>
          </div>
          {Array.isArray(selectedPurchase.items) && selectedPurchase.items.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Items</p>
              <div className="space-y-1">
                {selectedPurchase.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.product}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{item.qty} × ${Number(item.unit_cost).toFixed(2)}</p>
                      <p className="text-sm font-bold text-foreground">${Number(item.total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedPurchase.notes && (
            <div className="mt-3 p-3 bg-secondary/50 rounded-xl">
              <p className="text-xs text-muted-foreground"><span className="font-semibold">Notes:</span> {selectedPurchase.notes}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
