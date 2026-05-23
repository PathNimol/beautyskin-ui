'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { shopNameChangeRequestsApi } from '@/lib/api';
import type { ApiShopNameChangeRequest } from '@/lib/api/types';

type Props = {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onReviewed?: () => void;
};

export default function AdminShopNameChangeModal({ open, onClose, showToast, onReviewed }: Props) {
  const [requests, setRequests] = useState<ApiShopNameChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await shopNameChangeRequestsApi.list({ status: 'PENDING', limit: 50 });
      setRequests(page.content);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const review = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewingId(id);
    try {
      await shopNameChangeRequestsApi.review(id, { status });
      showToast(status === 'APPROVED' ? 'Shop name updated.' : 'Name change rejected.');
      await load();
      onReviewed?.();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Review failed');
    } finally {
      setReviewingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-requests-title"
      >
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-3 shrink-0">
          <div>
            <h2 id="name-requests-title" className="text-lg font-extrabold text-foreground">
              Shop name change requests
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review proposed renames from shop owners
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all shrink-0"
            aria-label="Close"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 p-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center">
              <Icon name="CheckCircleIcon" size={32} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-secondary/40 border border-border rounded-xl space-y-3"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {req.ownerName ?? 'Owner'} — {req.shopName ?? 'Shop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="line-through opacity-70">{req.currentName}</span>
                      <span className="mx-2">→</span>
                      <span className="font-semibold text-violet-700">{req.requestedName}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={reviewingId === req.id}
                      onClick={() => void review(req.id, 'APPROVED')}
                      className="flex-1 py-2 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={reviewingId === req.id}
                      onClick={() => void review(req.id, 'REJECTED')}
                      className="flex-1 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/** Hook: pending count for admin badge */
export function usePendingNameChangeCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCount(0);
      return;
    }
    try {
      const page = await shopNameChangeRequestsApi.list({ status: 'PENDING', limit: 1 });
      setCount(page.totalElements ?? page.content.length);
    } catch {
      setCount(0);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { count, refresh };
}
