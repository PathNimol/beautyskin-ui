'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDashboardNav } from '@/contexts/DashboardNavContext';
import { useMockAuth } from '@/contexts/MockAuthContext';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Icon from '@/components/ui/AppIcon';
import { startNavigation } from '@/lib/navigation';
import { NAV_ITEMS } from './nav-items';
import SidebarContent from './SidebarContent';
import type { UserRole } from '@/lib/mock/data';

export default function DashboardSidebar() {
  const { user, role, signOut } = useMockAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { pendingPath, beginNavigation } = useDashboardNav();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const normalizedRole = role === 'buyer' ? 'customer' : role;
  const visibleItems = NAV_ITEMS.filter(
    (item) => normalizedRole && item.roles.includes(normalizedRole as UserRole)
  );

  useEffect(() => {
    visibleItems.forEach((item) => router.prefetch(item.href));
  }, [visibleItems, router]);

  const handleNavClick = (href: string) => {
    beginNavigation(href);
    setMobileOpen(false);
  };

  const handleSignOutClick = () => {
    setMobileOpen(false);
    setSignOutOpen(true);
  };

  const handleConfirmSignOut = () => {
    setSignOutOpen(false);
    startNavigation();
    void signOut().then(() => router.push('/'));
  };

  const sharedProps = {
    user,
    role,
    visibleItems,
    pendingPath,
    pathname,
    onNavClick: handleNavClick,
    onSignOutClick: handleSignOutClick,
  };

  return (
    <>
      {/* Desktop */}
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
        <SidebarContent {...sharedProps} collapsed={collapsed} />
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
            <SidebarContent {...sharedProps} />
          </aside>
        </div>
      )}

      {/* Sign Out Dialog */}
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
