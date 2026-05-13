'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const navItems = [
  { label: 'Dashboard', icon: 'Squares2X2Icon', href: '/admin/dashboard', active: true },
  { label: 'Products', icon: 'ArchiveBoxIcon', href: '/product-listing' },
  { label: 'Orders', icon: 'ClipboardDocumentListIcon', href: '/admin/orders' },
  { label: 'Shops', icon: 'BuildingStorefrontIcon', href: '/admin/shops' },
  { label: 'Customers', icon: 'UsersIcon', href: '/admin/customers' },
  { label: 'Analytics', icon: 'ChartBarIcon', href: '/admin/analytics' },
  { label: 'Promotions', icon: 'TagIcon', href: '/admin/dashboard' },
  { label: 'Suppliers', icon: 'TruckIcon', href: '/admin/dashboard' },
  { label: 'Settings', icon: 'Cog6ToothIcon', href: '/settings' },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <div>
            <p className="font-bold text-sm text-foreground leading-none">BS Admin</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Beauty Skin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[44px] group ${
              item.active
                ? 'sidebar-active font-semibold text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={18} className={item.active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'} />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom: Store link */}
      <div className="p-3 border-t border-border">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all min-h-[44px]`}
        >
          <Icon name="ArrowTopRightOnSquareIcon" size={18} />
          {!collapsed && <span>View Store</span>}
        </Link>
        <Link
          href="/login"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all min-h-[44px]`}
        >
          <Icon name="ArrowRightOnRectangleIcon" size={18} />
          {!collapsed && <span>Sign Out</span>}
        </Link>
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
          aria-label="Toggle sidebar"
        >
          <Icon name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={12} />
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-soft"
        aria-label="Open sidebar"
      >
        <Icon name="Bars3Icon" size={18} />
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-admin-sidebar flex flex-col shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all"
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