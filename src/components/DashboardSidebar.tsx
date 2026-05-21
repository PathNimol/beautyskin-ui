'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useMockAuth } from '@/contexts/MockAuthContext';
import type { UserRole } from '@/lib/mock/data';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
  roles: UserRole[];
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Admin
  {
    label: 'Dashboard',
    icon: 'Squares2X2Icon',
    href: '/admin/dashboard',
    roles: ['admin'],
    section: 'main',
  },
  {
    label: 'All Shops',
    icon: 'BuildingStorefrontIcon',
    href: '/admin/all-shops',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'Manage Shops',
    icon: 'WrenchScrewdriverIcon',
    href: '/admin/shops',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'All Users',
    icon: 'UsersIcon',
    href: '/admin/customers',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'Analytics',
    icon: 'ChartBarIcon',
    href: '/admin/analytics',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'Platform Reports',
    icon: 'DocumentChartBarIcon',
    href: '/admin/reports',
    roles: ['admin'],
    section: 'admin',
  },
  {
    label: 'Orders',
    icon: 'ClipboardDocumentListIcon',
    href: '/admin/orders',
    roles: ['admin'],
    section: 'admin',
  },
  // Owner
  {
    label: 'Dashboard',
    icon: 'Squares2X2Icon',
    href: '/owner/dashboard',
    roles: ['owner'],
    section: 'main',
  },
  {
    label: 'Products',
    icon: 'ArchiveBoxIcon',
    href: '/owner/products',
    roles: ['owner'],
    section: 'shop',
  },
  {
    label: 'Inventory',
    icon: 'CubeIcon',
    href: '/owner/inventory',
    roles: ['owner'],
    section: 'shop',
  },
  {
    label: 'Orders',
    icon: 'ClipboardDocumentListIcon',
    href: '/owner/orders',
    roles: ['owner'],
    section: 'shop',
  },
  {
    label: 'POS System',
    icon: 'ComputerDesktopIcon',
    href: '/owner/pos',
    roles: ['owner'],
    section: 'shop',
  },
  {
    label: 'Staff',
    icon: 'UserGroupIcon',
    href: '/owner/staff',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Suppliers',
    icon: 'TruckIcon',
    href: '/owner/suppliers',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Purchases',
    icon: 'ShoppingCartIcon',
    href: '/owner/purchases',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Customers',
    icon: 'HeartIcon',
    href: '/owner/customers',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Promotions',
    icon: 'TagIcon',
    href: '/owner/promotions',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Reports',
    icon: 'ChartBarIcon',
    href: '/owner/reports',
    roles: ['owner'],
    section: 'management',
  },
  {
    label: 'Analytics',
    icon: 'PresentationChartLineIcon',
    href: '/owner/analytics',
    roles: ['owner'],
    section: 'management',
  },
  // Staff
  {
    label: 'Dashboard',
    icon: 'Squares2X2Icon',
    href: '/staff/dashboard',
    roles: ['staff'],
    section: 'main',
  },
  {
    label: 'Products',
    icon: 'ArchiveBoxIcon',
    href: '/staff/products',
    roles: ['staff'],
    section: 'shop',
  },
  {
    label: 'Inventory',
    icon: 'CubeIcon',
    href: '/staff/inventory',
    roles: ['staff'],
    section: 'shop',
  },
  {
    label: 'Orders',
    icon: 'ClipboardDocumentListIcon',
    href: '/staff/orders',
    roles: ['staff'],
    section: 'shop',
  },
  {
    label: 'POS System',
    icon: 'ComputerDesktopIcon',
    href: '/staff/pos',
    roles: ['staff'],
    section: 'shop',
  },
  {
    label: 'Revoke Requests',
    icon: 'ExclamationTriangleIcon',
    href: '/staff/revoke-requests',
    roles: ['staff'],
    section: 'staff',
  },
  // Shared
  {
    label: 'Chat',
    icon: 'ChatBubbleLeftRightIcon',
    href: '/chat',
    roles: ['admin', 'owner', 'staff'],
    section: 'shared',
  },
  {
    label: 'Direct Messages',
    icon: 'EnvelopeIcon',
    href: '/direct-messages',
    roles: ['admin', 'owner', 'staff'],
    section: 'shared',
  },
  {
    label: 'Settings',
    icon: 'Cog6ToothIcon',
    href: '/settings',
    roles: ['admin', 'owner', 'staff'],
    section: 'shared',
  },
  // Customer — "Shop" tab removed
  {
    label: 'My Account',
    icon: 'UserCircleIcon',
    href: '/customer/account',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
  {
    label: 'All Products',
    icon: 'ArchiveBoxIcon',
    href: '/customer/products',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
  {
    label: 'Cart',
    icon: 'ShoppingCartIcon',
    href: '/customer/cart',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
  {
    label: 'Chat',
    icon: 'ChatBubbleLeftRightIcon',
    href: '/customer/chat',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
  {
    label: 'Direct Messages',
    icon: 'EnvelopeIcon',
    href: '/customer/direct-messages',
    roles: ['customer', 'buyer'],
    section: 'customer',
  },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  owner: 'bg-rose-100 text-rose-700',
  staff: 'bg-blue-100 text-blue-700',
  customer: 'bg-green-100 text-green-700',
  buyer: 'bg-green-100 text-green-700',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
  owner: 'Shop Owner',
  staff: 'Staff',
  customer: 'Customer',
  buyer: 'Customer',
};

interface SidebarContentProps {
  collapsed?: boolean;
}

export default function DashboardSidebar() {
  const { user, role, signOut } = useMockAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const normalizedRole = role === 'buyer' ? 'customer' : role;
  const visibleItems = NAV_ITEMS.filter(
    (item) => normalizedRole && item.roles.includes(normalizedRole as UserRole)
  );

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const SidebarContent = ({ collapsed = false }: SidebarContentProps) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center px-3 py-3 border-b border-border">
        <AppLogo size={collapsed ? 40 : 200} />
      </Link>

      {/* User badge — click to go to profile */}
      {!collapsed && role && (
        <Link
          href={
            role === 'customer' || role === 'buyer'
              ? '/customer/account'
              : role === 'owner'
                ? '/owner/dashboard'
                : role === 'staff'
                  ? '/staff/dashboard'
                  : '/admin/dashboard'
          }
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
              onClick={() => setMobileOpen(false)}
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
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all min-h-[44px] ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <Icon name="ArrowTopRightOnSquareIcon" size={18} />
          {!collapsed && <span>View Store</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all min-h-[44px] ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <Icon name="ArrowRightOnRectangleIcon" size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        } shrink-0 sticky top-0 h-screen shadow-soft`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[83px] w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-all z-10 shadow-soft"
          aria-label="Toggle sidebar"
        >
          <Icon name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={12} />
        </button>
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-soft"
        aria-label="Open sidebar"
      >
        <Icon name="Bars3Icon" size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-card flex flex-col shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all z-10"
              aria-label="Close sidebar"
            >
              <Icon name="XMarkIcon" size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
