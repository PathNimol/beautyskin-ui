'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { startNavigation } from '@/lib/navigation';
import {
  dispatchOpenNameRequestsModal,
  NOTIFICATION_LINKS,
  resolveNotificationHref,
} from '@/lib/notifications/navigation';
import type { DbNotification } from '@/hooks/useRealtimeData';
import { useMockAuth } from '@/contexts/MockAuthContext';

export function useNotificationClick(markAsRead: (id: string) => Promise<void>) {
  const router = useRouter();
  const { role } = useMockAuth();

  const onNotificationClick = useCallback(
    async (n: DbNotification, options?: { closePanel?: () => void }) => {
      void markAsRead(n.id);
      const href = resolveNotificationHref(
        {
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          shop_id: n.shop_id,
        },
        role
      );

      options?.closePanel?.();

      if (!href) return;

      if (href === NOTIFICATION_LINKS.adminShopsNameRequests) {
        const path = window.location.pathname;
        if (path === '/admin/shops') {
          dispatchOpenNameRequestsModal();
          return;
        }
      }

      startNavigation();
      router.push(href);
    },
    [markAsRead, role, router]
  );

  return { onNotificationClick };
}
