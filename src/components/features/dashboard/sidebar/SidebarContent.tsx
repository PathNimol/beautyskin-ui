'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { ROLE_COLORS, ROLE_LABELS, profileHref, type NavItem } from './nav-items';
import { useRealtimeNotifications } from '@/hooks/useRealtimeData';
import type { DbNotification } from '@/hooks/useRealtimeData';
import { useNotificationClick } from '@/hooks/useNotificationClick';

interface SidebarContentProps {
  collapsed?: boolean;
  user: { name?: string; email?: string; avatar?: string; avatarAlt?: string } | null;
  role: string | null;
  visibleItems: NavItem[];
  pendingPath: string | null;
  pathname: string;
  onNavClick: (href: string) => void;
  onSignOutClick: () => void;
}

export default function SidebarContent({
  collapsed = false,
  user,
  role,
  visibleItems,
  pendingPath,
  pathname,
  onNavClick,
  onSignOutClick,
}: SidebarContentProps) {
  const isActive = (href: string) =>
    pendingPath != null
      ? pendingPath === href || pendingPath.startsWith(href + '/')
      : pathname === href || pathname.startsWith(href + '/');

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

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center px-3 py-3 border-b border-border">
        <AppLogo size={collapsed ? 40 : 200} />
      </Link>

      {/* User badge */}
      {!collapsed && role && (
        <Link
          href={profileHref(role)}
          className="px-4 py-3 border-b border-border flex items-center gap-2.5 hover:bg-secondary transition-colors group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
            {user?.avatar ? (
              <AppImage
                src={user.avatar}
                alt={user.avatarAlt || 'User avatar'}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                <Icon name="UserIcon" size={14} className="text-rose-deep" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate group-hover:text-rose-deep transition-colors">
              {user?.name}
            </p>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${ROLE_COLORS[role]}`}
            >
              {ROLE_LABELS[role]}
            </span>
          </div>
          <Icon
            name="ChevronRightIcon"
            size={12}
            className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </Link>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label + item.href}
              href={item.href}
              prefetch
              scroll={false}
              data-skip-nav-progress
              onClick={() => onNavClick(item.href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[44px] group relative ${
                active
                  ? 'bg-primary/15 text-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <Icon
                name={item.icon as Parameters<typeof Icon>[0]['name']}
                size={18}
                className={
                  active
                    ? 'text-rose-deep'
                    : 'text-muted-foreground group-hover:text-foreground transition-colors'
                }
              />
              {!collapsed && <span className="text-sm flex-1">{item.label}</span>}
              {!collapsed && item.badge && item.badge > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-0.5">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o: boolean) => !o)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all min-h-[44px] ${
              collapsed ? 'justify-center px-2' : ''
            }`}
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

          {/* Dropdown */}
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
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 20).map((n: DbNotification) => (
                    <button
                      key={n.id}
                      onClick={() =>
                        void onNotificationClick(n, { closePanel: () => setNotifOpen(false) })
                      }
                      className={`w-full text-left px-4 py-3 hover:bg-secondary transition-all ${
                        !n.is_read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            !n.is_read ? 'bg-primary' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all min-h-[44px] ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Icon name="ArrowTopRightOnSquareIcon" size={18} />
          {!collapsed && <span>View Store</span>}
        </Link>
        <button
          onClick={onSignOutClick}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all min-h-[44px] ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Icon name="ArrowRightOnRectangleIcon" size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
