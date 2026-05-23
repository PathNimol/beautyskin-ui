'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { shopNameChangeRequestsApi } from '@/lib/api';
import type { ApiShopNameChangeRequest } from '@/lib/api/types';
import type { DbShop } from '@/hooks/useRealtimeData';

type Props = {
  open: boolean;
  shop: DbShop | null;
  onClose: () => void;
  showToast: (msg: string) => void;
  onSubmitted?: () => void;
};

export default function OwnerShopNameChangeModal({
  open,
  shop,
  onClose,
  showToast,
  onSubmitted,
}: Props) {
  const [requestedName, setRequestedName] = useState('');
  const [pending, setPending] = useState<ApiShopNameChangeRequest | null>(null);
  const [loadingPending, setLoadingPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPending = useCallback(async () => {
    if (!shop) return;
    setLoadingPending(true);
    try {
      const page = await shopNameChangeRequestsApi.list({
        shopId: shop.id,
        status: 'PENDING',
        limit: 1,
      });
      const item = page.content[0] ?? null;
      setPending(item);
      setRequestedName(item?.requestedName ?? shop.name);
    } catch {
      setPending(null);
      setRequestedName(shop.name);
    } finally {
      setLoadingPending(false);
    }
  }, [shop]);

  useEffect(() => {
    if (open && shop) void loadPending();
  }, [open, shop, loadPending]);

  const handleRequest = async () => {
    if (!shop) return;
    const name = requestedName.trim();
    if (name.length < 2) {
      showToast('Shop name must be at least 2 characters.');
      return;
    }
    if (name === shop.name) {
      showToast('Enter a different name than the current shop name.');
      return;
    }
    setSubmitting(true);
    try {
      await shopNameChangeRequestsApi.create(shop.id, { requestedName: name });
      showToast('Name change request submitted. An admin will review it.');
      await loadPending();
      onSubmitted?.();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !shop) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Change shop name</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{shop.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all"
            aria-label="Close"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground">
            Current name: <span className="font-semibold text-foreground">{shop.name}</span>
          </p>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Proposed new name
            </label>
            <input
              type="text"
              value={requestedName}
              onChange={(e) => setRequestedName(e.target.value)}
              disabled={!!pending || submitting || loadingPending}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>
          {loadingPending ? (
            <p className="text-xs text-muted-foreground">Checking pending requests…</p>
          ) : pending ? (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
              <Icon name="ClockIcon" size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">Pending admin approval</p>
                <p className="text-amber-700 mt-0.5">
                  Waiting to rename to &quot;{pending.requestedName}&quot;
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
          >
            Cancel
          </button>
          {!pending && (
            <button
              type="button"
              onClick={() => void handleRequest()}
              disabled={submitting || requestedName.trim() === shop.name}
              className="flex-1 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Icon name="PaperAirplaneIcon" size={15} />
                  Request
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
