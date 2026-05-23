'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useCart } from '@/contexts/CartContext';
import { getRoleHomePath, normalizeRoleKey } from '@/lib/auth/redirects';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/product-listing' },
  { label: 'Categories', href: '/product-listing' },
  { label: 'Offers', href: '/product-listing' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // ✅ mounted guards ALL auth-dependent rendering — server always sees false
  const [mounted, setMounted] = useState(false);
  const { itemCount: cartCount } = useCart();
  const { isAuthenticated, role, signOut } = useMockAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Before mount, treat user as unauthenticated — matches server render
  const authed = mounted && isAuthenticated;
  const roleKey = normalizeRoleKey(role);
  const dashboardHref =
    roleKey === 'customer' ? '/customer/account' : getRoleHomePath(role);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-white/90 backdrop-blur-xl shadow-card py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <AppLogo size={50} />
            <span className="font-display font-bold text-lg tracking-tight text-foreground group-hover:text-accent transition-colors">
              BS Online Shop
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks?.map((link) => (
              <Link
                key={link?.label}
                href={link?.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link?.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Icon name="MagnifyingGlassIcon" size={18} />
            </button>

            <Link
              href="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              aria-label="Shopping cart"
            >
              <Icon name="ShoppingBagIcon" size={18} />
              {/* Cart count is also client-only — guard with mounted */}
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ✅ Auth buttons: before mount render logged-out state (matches SSR) */}
            {!mounted ? (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
                >
                  <Icon name="UserIcon" size={15} />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-foreground text-sm font-semibold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
                >
                  <Icon name="UserPlusIcon" size={15} />
                  Register
                </Link>
              </>
            ) : authed ? (
              <>
                <Link
                  href={dashboardHref}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-foreground text-sm font-semibold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
                >
                  <Icon name="Squares2X2Icon" size={15} />
                  {role === 'customer' || role === 'buyer' ? 'My Account' : 'Dashboard'}
                </Link>
                <button
                  onClick={signOut}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
                >
                  <Icon name="ArrowRightOnRectangleIcon" size={15} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
                >
                  <Icon name="UserIcon" size={15} />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-foreground text-sm font-semibold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
                >
                  <Icon name="UserPlusIcon" size={15} />
                  Register
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-foreground hover:bg-secondary transition-all"
              aria-label="Open menu"
            >
              <Icon name="Bars3Icon" size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-card shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="font-display font-bold text-lg text-foreground">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all"
                aria-label="Close menu"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <nav className="flex flex-col p-6 gap-1">
              {navLinks?.map((link) => (
                <Link
                  key={link?.label}
                  href={link?.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-secondary hover:text-accent transition-all"
                >
                  {link?.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {/* Mobile menu also guarded by mounted + authed */}
                {authed ? (
                  <>
                    <Link
                      href={dashboardHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 bg-primary text-foreground rounded-xl font-semibold hover:bg-rose-deep hover:text-white transition-all"
                    >
                      <Icon name="Squares2X2Icon" size={16} />
                      {role === 'customer' || role === 'buyer' ? 'My Account' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-border transition-all"
                    >
                      <Icon name="ArrowRightOnRectangleIcon" size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-border transition-all"
                    >
                      <Icon name="UserIcon" size={16} />
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 bg-primary text-foreground rounded-xl font-semibold hover:bg-rose-deep hover:text-white transition-all"
                    >
                      <Icon name="UserPlusIcon" size={16} />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
