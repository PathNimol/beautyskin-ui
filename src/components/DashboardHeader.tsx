'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useRealtimeNotifications, type DbNotification } from '@/hooks/useRealtimeData';
import { useNotificationClick } from '@/hooks/useNotificationClick';
import type { UserRole } from '@/lib/mock/data';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Super Admin',
  owner: 'Shop Owner',
  staff: 'Staff',
  customer: 'Customer',
  buyer: 'Customer',
};

const NOTIF_ICON: Record<DbNotification['type'], string> = {
  new_order: 'ShoppingBagIcon',
  low_stock: 'ExclamationTriangleIcon',
  expiry_alert: 'ClockIcon',
  promotion: 'TagIcon',
  review: 'StarIcon',
  system: 'BellIcon',
  shop_approval: 'BuildingStorefrontIcon',
  shop_name_change: 'PencilSquareIcon',
};

const NOTIF_COLOR: Record<DbNotification['type'], string> = {
  new_order: 'bg-green-50 text-green-600',
  low_stock: 'bg-red-50 text-red-500',
  expiry_alert: 'bg-amber-50 text-amber-500',
  promotion: 'bg-purple-50 text-purple-500',
  review: 'bg-blue-50 text-blue-500',
  system: 'bg-secondary text-muted-foreground',
  shop_approval: 'bg-amber-50 text-amber-600',
  shop_name_change: 'bg-violet-50 text-violet-600',
};

function profileHref(role: UserRole | null): string {
  if (!role) return '/';
  if (role === 'customer' || role === 'buyer') return '/customer/account';
  if (role === 'owner') return '/owner/dashboard';
  if (role === 'staff') return '/staff/dashboard';
  return '/admin/dashboard';
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function NotifToast({ notif, onDismiss }: { notif: DbNotification; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 bg-card border border-border rounded-2xl shadow-xl px-4 py-3.5 w-80 animate-slide-in">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${NOTIF_COLOR[notif.type]}`}
      >
        <Icon name={NOTIF_ICON[notif.type] as Parameters<typeof Icon>[0]['name']} size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground">{notif.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {notif.message}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Icon name="XMarkIcon" size={14} />
      </button>
    </div>
  );
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────
export default function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, role, signOut } = useMockAuth();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const { notifications, unreadCount, toastQueue, markAsRead, markAllAsRead, dismissToast } =
    useRealtimeNotifications();
  const { onNotificationClick } = useNotificationClick(markAsRead);

  const handleSignOut = () => {
    setProfileOpen(false);
    setSignOutOpen(true);
  };

  const handleConfirmSignOut = () => {
    setSignOutOpen(false);
    signOut();
    router.push('/login');
  };

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between gap-4">
        <div className="pl-10 md:pl-0">
          <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="relative w-9 h-9 bg-secondary border border-border rounded-xl flex items-center justify-center hover:bg-primary/10 transition-all"
              aria-label="Notifications"
            >
              <Icon name="BellIcon" size={17} className="text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-sm">Notifications</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-accent hover:text-gold-deep transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-border max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Icon name="BellSlashIcon" size={28} className="text-border mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        onClick={() =>
                          void onNotificationClick(n, { closePanel: () => setNotifOpen(false) })
                        }
                        className={`px-5 py-3.5 hover:bg-secondary transition-all cursor-pointer ${
                          !n.is_read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${NOTIF_COLOR[n.type]}`}
                          >
                            <Icon
                              name={NOTIF_ICON[n.type] as Parameters<typeof Icon>[0]['name']}
                              size={14}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                              {relativeTime(n.created_at)}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-5 py-3 border-t border-border">
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-semibold text-accent hover:text-gold-deep transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-xl hover:bg-primary/10 transition-all"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-border shrink-0">
                {user?.avatar ? (
                  <AppImage
                    src={user.avatar}
                    alt={user?.avatarAlt || 'User'}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <Icon name="UserIcon" size={13} className="text-rose-deep" />
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-foreground leading-none">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {role ? ROLE_LABELS[role] : ''}
                </p>
              </div>
              <Icon
                name="ChevronDownIcon"
                size={13}
                className="text-muted-foreground hidden sm:block"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-11 w-52 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                <Link
                  href={profileHref(role)}
                  onClick={() => setProfileOpen(false)}
                  className="px-4 py-3 border-b border-border flex items-center gap-2 hover:bg-secondary transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-rose-deep transition-colors">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Icon
                    name="ChevronRightIcon"
                    size={12}
                    className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </Link>
                <div className="p-2">
                  <Link
                    href={profileHref(role)}
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-all"
                  >
                    <Icon name="UserCircleIcon" size={15} />
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Icon name="ArrowRightOnRectangleIcon" size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        open={signOutOpen}
        title="Sign Out"
        description="Are you sure you want to sign out? You'll need to sign in again to access your account."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="danger"
        icon="ArrowRightOnRectangleIcon"
        onConfirm={handleConfirmSignOut}
        onCancel={() => setSignOutOpen(false)}
      />

      {/* Toast Stack */}
      {toastQueue.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[500] flex flex-col gap-3 pointer-events-none">
          {toastQueue.slice(0, 4).map((n) => (
            <div key={n.id} className="pointer-events-auto">
              <NotifToast notif={n} onDismiss={() => dismissToast(n.id)} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
