'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useRealtimeNotifications, type DbNotification } from '@/hooks/useRealtimeData';
import { useNotificationClick } from '@/hooks/useNotificationClick';
import { revokeRequestsApi } from '@/lib/api';
import { NOTIFICATION_LINKS } from '@/lib/notifications/navigation';

export default function OwnerRevokeAlertsBanner() {
  const { role, user, shopId: authShopId } = useMockAuth();
  const shopId = authShopId ?? user?.shopId ?? null;
  const pathname = usePathname();
  const { notifications, markAsRead } = useRealtimeNotifications();
  const { onNotificationClick } = useNotificationClick(markAsRead);

  const [pendingCount, setPendingCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const fetchPending = useCallback(async () => {
    if (!shopId) {
      setPendingCount(0);
      return;
    }
    try {
      const page = await revokeRequestsApi.list(shopId, { status: 'PENDING', limit: 50 });
      const pending = (page.content || []).filter(
        (r) => (r.status?.toUpperCase() || 'PENDING') === 'PENDING'
      );
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  }, [shopId]);

  useEffect(() => {
    if (role !== 'owner') return;
    void fetchPending();
    const interval = setInterval(fetchPending, 30000);
    const onRefresh = () => void fetchPending();
    window.addEventListener('bs-notifications-refresh', onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('bs-notifications-refresh', onRefresh);
    };
  }, [role, fetchPending]);

  const revokeNotifs = notifications.filter(
    (n) =>
      !n.is_read &&
      (n.type === 'product_revoke' ||
        n.title.toLowerCase().includes('revoke') ||
        n.message.toLowerCase().includes('revoke'))
  );

  if (role !== 'owner' || dismissed || pathname.includes('/revoke-requests')) {
    return null;
  }

  const showBanner = pendingCount > 0 || revokeNotifs.length > 0;
  if (!showBanner) return null;

  const handleNotifClick = (n: DbNotification) => {
    void onNotificationClick(n);
  };

  return (
    <div className="mb-6 space-y-3">
      {pendingCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 md:p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-amber-700" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-amber-900">
                {pendingCount} revoke request{pendingCount !== 1 ? 's' : ''} need your review
              </p>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Staff submitted product removals — approve or reject from Revoke Requests.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={NOTIFICATION_LINKS.ownerRevokeRequests}
              className="px-4 py-2.5 bg-primary text-foreground text-xs font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
            >
              Review now
            </Link>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <Icon name="XMarkIcon" size={16} />
            </button>
          </div>
        </div>
      )}

      {revokeNotifs.slice(0, 3).map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => handleNotifClick(n)}
          className="w-full text-left flex items-start gap-3 p-4 bg-card border border-rose-200 rounded-2xl hover:bg-rose-50/50 transition-all shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <Icon name="ExclamationTriangleIcon" size={16} className="text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{n.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
          </div>
          <span className="text-[10px] font-semibold text-primary shrink-0">View →</span>
        </button>
      ))}
    </div>
  );
}
