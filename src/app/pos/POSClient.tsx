'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { createClient } from '@/lib/supabase/client';
import { MOCK_PRODUCTS } from '@/lib/mock/data';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  sku: string;
}

interface PosReceipt {
  id: string;
  receipt_ref: string;
  customer_name: string;
  customer_phone: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: string;
  receipt_status: 'active' | 'cancelled' | 'refunded';
  staff_name: string;
  created_at: string;
  cancelled_by?: string;
  cancel_reason?: string;
}

const PAYMENT_METHODS = ['Cash', 'Card', 'QR', 'Bank Transfer'];
const TAX_RATE = 0.10;
const DAILY_CANCEL_LIMIT = 3;

export default function POSClient() {
  const { user, role, shopId } = useMockAuth();
  const supabase = createClient();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [receipts, setReceipts] = useState<PosReceipt[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pos' | 'receipts'>('pos');
  const [cancelModal, setCancelModal] = useState<{ open: boolean; receipt: PosReceipt | null }>({ open: false, receipt: null });
  const [cancelReason, setCancelReason] = useState('');
  const [todayCancels, setTodayCancels] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const products = MOCK_PRODUCTS.filter(p => p.stock > 0);
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxAmount = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + taxAmount;

  const fetchReceipts = useCallback(async () => {
    setReceiptsLoading(true);
    try {
      const { data } = await supabase
        .from('pos_receipts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setReceipts(data as PosReceipt[]);
    } catch { /* ignore */ }
    setReceiptsLoading(false);
  }, [supabase]);

  const fetchTodayCancels = useCallback(async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('receipt_cancellations')
        .select('*', { count: 'exact', head: true })
        .eq('staff_id', user.id)
        .eq('cancel_date', today);
      setTodayCancels(count || 0);
    } catch { /* ignore */ }
  }, [supabase, user]);

  useEffect(() => {
    fetchReceipts();
    fetchTodayCancels();

    const channel = supabase
      .channel('pos_receipts_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_receipts' }, () => {
        fetchReceipts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchReceipts, fetchTodayCancels, supabase]);

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, sku: product.sku }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    }
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setPaymentMethod('Cash');
  };

  const processCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    setErrorMsg('');
    try {
      const ref = `RCP-${Date.now()}`;
      const { error } = await supabase.from('pos_receipts').insert({
        receipt_ref: ref,
        shop_id: null,
        shop_name: user?.shopId ? 'GlowSkin Store' : 'BS Online Shop',
        staff_id: user?.id || '',
        staff_name: user?.name || '',
        customer_name: customerName || 'Walk-in Customer',
        customer_phone: customerPhone,
        items: cart,
        subtotal,
        discount,
        tax: taxAmount,
        total,
        payment_method: paymentMethod,
        receipt_status: 'active',
      });
      if (error) throw error;
      setSuccessMsg(`Receipt ${ref} created successfully!`);
      clearCart();
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchReceipts();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to process checkout');
    }
    setProcessing(false);
  };

  const openCancelModal = (receipt: PosReceipt) => {
    if (role === 'staff' && todayCancels >= DAILY_CANCEL_LIMIT) {
      setErrorMsg(`Daily cancellation limit reached (${DAILY_CANCEL_LIMIT}/day for staff). Contact your owner.`);
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    setCancelModal({ open: true, receipt });
    setCancelReason('');
  };

  const confirmCancel = async () => {
    if (!cancelModal.receipt || !cancelReason.trim()) return;
    setProcessing(true);
    try {
      const { error: receiptError } = await supabase
        .from('pos_receipts')
        .update({
          receipt_status: 'cancelled',
          cancelled_by: user?.name || '',
          cancel_reason: cancelReason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', cancelModal.receipt.id);
      if (receiptError) throw receiptError;

      await supabase.from('receipt_cancellations').insert({
        receipt_id: cancelModal.receipt.id,
        staff_id: user?.id || '',
        staff_name: user?.name || '',
        cancel_date: new Date().toISOString().split('T')[0],
        reason: cancelReason,
      });

      setTodayCancels(prev => prev + 1);
      setCancelModal({ open: false, receipt: null });
      setSuccessMsg('Receipt cancelled successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchReceipts();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to cancel receipt');
    }
    setProcessing(false);
  };

  const canCancelReceipt = (receipt: PosReceipt) => {
    if (receipt.receipt_status !== 'active') return false;
    if (role === 'owner') return true;
    return todayCancels < DAILY_CANCEL_LIMIT;
  };

  return (
    <DashboardLayout title="POS System" subtitle="Point of Sale — process walk-in sales">
      {/* Alerts */}
      {successMsg && (
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['pos', 'receipts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-primary text-foreground shadow-rose' : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            {tab === 'pos' ? '🛒 New Sale' : '🧾 Receipts'}
          </button>
        ))}
        {role === 'staff' && (
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <Icon name="ExclamationTriangleIcon" size={15} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">
              Cancellations today: {todayCancels}/{DAILY_CANCEL_LIMIT}
            </span>
          </div>
        )}
      </div>

      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filtered.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary hover:shadow-rose transition-all group"
                >
                  <div className="w-full aspect-square bg-secondary rounded-lg mb-2 overflow-hidden">
                    <img src={product.image} alt={product.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-xs font-bold text-foreground line-clamp-2 leading-tight">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{product.sku}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-sm font-extrabold text-rose-deep">${product.price.toFixed(2)}</p>
                    <span className="text-[10px] text-muted-foreground">Stock: {product.stock}</span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-3 py-12 text-center text-muted-foreground">
                  <Icon name="ArchiveBoxXMarkIcon" size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No products found</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 h-fit sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Cart</h3>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear all</button>
              )}
            </div>

            {/* Cart Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Icon name="ShoppingCartIcon" size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Add products to cart</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 bg-card border border-border rounded-lg flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-600 transition-all">-</button>
                      <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 bg-card border border-border rounded-lg flex items-center justify-center text-xs hover:bg-green-50 hover:text-green-600 transition-all">+</button>
                    </div>
                    <p className="text-xs font-bold text-foreground w-14 text-right">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>

            {/* Customer Info */}
            <div className="space-y-2 border-t border-border pt-3">
              <input
                type="text"
                placeholder="Customer name (optional)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Phone (optional)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
              />
            </div>

            {/* Discount & Payment */}
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground w-20 shrink-0">Discount $</label>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={e => setDiscount(Math.min(Number(e.target.value), subtotal))}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground w-20 shrink-0">Payment</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                >
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Discount</span><span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tax (10%)</span><span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-foreground pt-1 border-t border-border">
                <span>Total</span><span className="text-rose-deep">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={processCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <><div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />Processing...</>
              ) : (
                <><Icon name="PrinterIcon" size={16} />Checkout & Print Receipt</>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-bold text-foreground">Recent Receipts</h3>
            <p className="text-xs text-muted-foreground mt-0.5">All POS transactions for your shop</p>
          </div>
          {receiptsLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Icon name="DocumentTextIcon" size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No receipts yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    {['Receipt', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {receipts.map(r => (
                    <tr key={r.id} className="hover:bg-secondary/30 transition-all">
                      <td className="px-4 py-3 text-xs font-bold text-foreground">{r.receipt_ref}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{r.customer_name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{Array.isArray(r.items) ? r.items.length : 0} items</td>
                      <td className="px-4 py-3 text-xs font-bold text-rose-deep">${Number(r.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.payment_method}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          r.receipt_status === 'active' ? 'bg-green-50 text-green-700' :
                          r.receipt_status === 'cancelled'? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {r.receipt_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {canCancelReceipt(r) && (
                          <button
                            onClick={() => openCancelModal(r)}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        {r.receipt_status === 'cancelled' && r.cancel_reason && (
                          <span className="text-[10px] text-muted-foreground italic">{r.cancel_reason}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal.open && cancelModal.receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setCancelModal({ open: false, receipt: null })} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-foreground mb-1">Cancel Receipt</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Cancelling <span className="font-bold text-foreground">{cancelModal.receipt.receipt_ref}</span>
              {role === 'staff' && (
                <span className="ml-2 text-amber-600 font-semibold">({todayCancels + 1}/{DAILY_CANCEL_LIMIT} today)</span>
              )}
            </p>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (required)..."
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, receipt: null })}
                className="flex-1 py-2.5 bg-secondary border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary/80 transition-all"
              >
                Keep Receipt
              </button>
              <button
                onClick={confirmCancel}
                disabled={!cancelReason.trim() || processing}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {processing ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
