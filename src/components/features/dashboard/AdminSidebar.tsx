'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeData';
import { useNotificationClick } from '@/hooks/useNotificationClick';
import { useEffect, useRef } from 'react';

const navItems = [
  { label: 'Dashboard', icon: 'Squares2X2Icon', href: '/admin/dashboard' },
  { label: 'Shops', icon: 'BuildingStorefrontIcon', href: '/admin/shops' },
  { label: 'Customers', icon: 'UsersIcon', href: '/admin/customers' },
  { label: 'Orders', icon: 'ClipboardDocumentListIcon', href: '/admin/orders' },
  { label: 'Products', icon: 'ArchiveBoxIcon', href: '/admin/products' },
  { label: 'Inventory', icon: 'CubeIcon', href: '/admin/inventory' },
  { label: 'Analytics', icon: 'ChartBarIcon', href: '/admin/analytics' },
  { label: 'Reports', icon: 'DocumentChartBarIcon', href: '/admin/reports' },
  { label: 'Settings', icon: 'Cog6ToothIcon', href: '/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useMockAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications();
  const { onNotificationClick } = useNotificationClick(markAsRead);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOutClick = () => {
    setMobileOpen(false);
    setSignOutOpen(true);
  };

  const handleConfirmSignOut = async () => {
    setSignOutOpen(false);
    await signOut();
    router.push('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <Link
        href="/"
        className={`flex items-center gap-3 px-5 py-5 border-b border-border ${collapsed ? 'justify-center' : ''}`}
      >
        <AppLogo size={32} />
        {!collapsed && (
          <div>
            <p className="font-bold text-sm text-foreground leading-none">BS Online Shop</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Admin</p>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="Admin navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch
              scroll={false}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[44px] group ${
                isActive
                  ? 'sidebar-active font-semibold text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                name={item.icon as Parameters<typeof Icon>[0]['name']}
                size={18}
                className={
                  isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                }
              />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-border space-y-0.5">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all min-h-[44px] ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            aria-label="Notifications"
          >
            <div className="relative shrink-0">
              <Icon name="BellIcon" size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary text-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            {!collapsed && <span className="flex-1 text-left">Notifications</span>}
            {!collapsed && unreadCount > 0 && (
              <span className="ml-auto bg-primary text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-[200] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-bold text-foreground">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-primary font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() =>
                        void onNotificationClick(n, { closePanel: () => setNotifOpen(false) })
                      }
                      className={`w-full text-left px-4 py-3 hover:bg-secondary transition-all ${
                        !n.is_read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <p className="text-xs font-semibold text-foreground">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all min-h-[44px]"
        >
          <Icon name="ArrowTopRightOnSquareIcon" size={18} />
          {!collapsed && <span>View Store</span>}
        </Link>
        <button
          onClick={handleSignOutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all min-h-[44px]"
        >
          <Icon name="ArrowRightOnRectangleIcon" size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-admin-sidebar border-r border-border transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        } shrink-0 sticky top-0 h-screen`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-all z-10 shadow-soft"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={12} />
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-soft"
        aria-label="Open navigation"
      >
        <Icon name="Bars3Icon" size={18} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-admin-sidebar flex flex-col shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all"
              aria-label="Close navigation"
            >
              <Icon name="XMarkIcon" size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

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
    </>
  );
}
