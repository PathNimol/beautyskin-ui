'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { revokeRequestsApi, productsApi } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import type { ApiProduct } from '@/lib/api/types';
import { broadcastNotificationsRefresh } from '@/hooks/useRealtimeData';

interface RevokeRequest {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  reason: 'expired' | 'broken' | 'tester' | 'other';
  reason_detail: string;
  status: 'pending' | 'approved' | 'rejected';
  requester_name: string;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const REASON_LABELS: Record<string, string> = {
  expired: '🗓️ Expired',
  broken: '💔 Broken/Damaged',
  tester: '🧪 Tester Used',
  other: '📝 Other',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

function apiErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export default function RevokeRequestsClient() {
  const { user, role, shopId: authShopId } = useMockAuth();
  const shopId = authShopId ?? user?.shopId ?? null;

  const [requests, setRequests] = useState<RevokeRequest[]>([]);
  const [merchantProducts, setMerchantProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [reviewModal, setReviewModal] = useState<{ open: boolean; request: RevokeRequest | null; action: 'approved' | 'rejected' | null }>({ open: false, request: null, action: null });
  const [reviewNotes, setReviewNotes] = useState('');

  const [form, setForm] = useState({
    product_id: '',
    product_name: '',
    sku: '',
    quantity: 1,
    reason: 'expired' as 'expired' | 'broken' | 'tester' | 'other',
    reason_detail: '',
  });

  const fetchRequests = useCallback(async () => {
    if (!shopId) {
      setLoading(false);
      setErrorMsg('No shop is assigned to your account. Contact your shop owner or admin.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const page = await revokeRequestsApi.list(shopId);
      setRequests(
        (page.content || []).map((r) => ({
          id: r.id,
          product_name: r.productName || '',
          sku: r.sku || '',
          quantity: r.quantity,
          reason: (r.reason?.toLowerCase() || 'other') as RevokeRequest['reason'],
          reason_detail: r.detail || '',
          status: (r.status?.toLowerCase() || 'pending') as RevokeRequest['status'],
          requester_name: r.requesterName || r.requesterEmail || '—',
          review_notes: r.reviewNotes || null,
          created_at: r.createdAt || '',
          reviewed_at: null,
        }))
      );
    } catch (e: unknown) {
      setErrorMsg(apiErrorMessage(e, 'Failed to load revoke requests'));
    }
    setLoading(false);
  }, [shopId]);

  useEffect(() => {
    fetchRequests();
    if (shopId) {
      productsApi.listMerchant(shopId, { limit: 200 }).then((p) => setMerchantProducts(p.content || [])).catch(() => {});
    }
  }, [fetchRequests, shopId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_name || !form.reason_detail) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      if (!shopId || !form.product_id) throw new Error('Shop and product required');
      await revokeRequestsApi.create(shopId, {
        productId: form.product_id,
        quantity: form.quantity,
        reason: form.reason.toUpperCase(),
        detail: form.reason_detail,
      });
      setSuccessMsg('Revoke request submitted. Your shop owner will be notified.');
      broadcastNotificationsRefresh();
      setShowForm(false);
      setForm({ product_id: '', product_name: '', sku: '', quantity: 1, reason: 'expired', reason_detail: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchRequests();
    } catch (e: unknown) {
      setErrorMsg(apiErrorMessage(e, 'Failed to submit request'));
    }
    setSaving(false);
  };

  const handleReview = async () => {
    if (!reviewModal.request || !reviewModal.action) return;
    setSaving(true);
    try {
      await revokeRequestsApi.review(reviewModal.request.id, {
        status: reviewModal.action.toUpperCase(),
        notes: reviewNotes,
      });
      setReviewModal({ open: false, request: null, action: null });
      setReviewNotes('');
      setSuccessMsg(`Request ${reviewModal.action}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchRequests();
    } catch (e: unknown) {
      setErrorMsg(apiErrorMessage(e, 'Failed to review request'));
    }
    setSaving(false);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const canReview = role === 'owner' || role === 'admin';

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
          { label: 'Total Requests', value: requests.length, color: 'bg-blue-50 text-blue-600', icon: 'ClipboardDocumentListIcon' },
          { label: 'Pending Review', value: pendingCount, color: 'bg-amber-50 text-amber-600', icon: 'ClockIcon' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'bg-green-50 text-green-600', icon: 'CheckCircleIcon' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: 'bg-red-50 text-red-600', icon: 'XCircleIcon' },
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

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-foreground">
          Revoke Requests
          {pendingCount > 0 && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{pendingCount} pending</span>}
        </h2>
        {role === 'staff' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground font-semibold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose text-sm"
          >
            <Icon name="PlusIcon" size={16} />
            New Request
          </button>
        )}
      </div>

      {/* New Request Form */}
      {showForm && role === 'staff' && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">Submit Revoke Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Product *</label>
                <select
                  value={form.product_name}
                  onChange={e => {
                    const prod = merchantProducts.find(p => p.name === e.target.value);
                    setForm(prev => ({
                      ...prev,
                      product_name: e.target.value,
                      product_id: prod?.id || '',
                      sku: prod?.sku || '',
                    }));
                  }}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select product...</option>
                  {merchantProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Quantity *</label>
                <input
                  type="number" min="1" value={form.quantity}
                  onChange={e => setForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Reason *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.keys(REASON_LABELS) as Array<'expired' | 'broken' | 'tester' | 'other'>).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, reason: r }))}
                    className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      form.reason === r ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {REASON_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Details *</label>
              <textarea
                value={form.reason_detail}
                onChange={e => setForm(prev => ({ ...prev, reason_detail: e.target.value }))}
                rows={3}
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-secondary border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary/80 transition-all">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50 text-sm">
                {saving ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Icon name="ExclamationTriangleIcon" size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No revoke requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  {['Product', 'SKU', 'Qty', 'Reason', 'Details', 'Requested By', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-all">
                    <td className="px-4 py-3 text-xs font-bold text-foreground">{r.product_name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.sku}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{r.quantity}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{REASON_LABELS[r.reason]}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{r.reason_detail}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.requester_name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {canReview && r.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setReviewModal({ open: true, request: r, action: 'approved' })}
                            className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition-all"
                          >Approve</button>
                          <button
                            onClick={() => setReviewModal({ open: true, request: r, action: 'rejected' })}
                            className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-all"
                          >Reject</button>
                        </div>
                      )}
                      {r.review_notes && <p className="text-[10px] text-muted-foreground italic mt-1">{r.review_notes}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.open && reviewModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setReviewModal({ open: false, request: null, action: null })} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-foreground mb-1 capitalize">{reviewModal.action} Request</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {reviewModal.request.product_name} — {reviewModal.request.quantity} units ({REASON_LABELS[reviewModal.request.reason]})
            </p>
            <textarea
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Review notes (optional)..."
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setReviewModal({ open: false, request: null, action: null })} className="flex-1 py-2.5 bg-secondary border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary/80 transition-all">Cancel</button>
              <button
                onClick={handleReview}
                disabled={saving}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${reviewModal.action === 'approved' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
              >
                {saving ? 'Saving...' : `Confirm ${reviewModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
