'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const MIN_VISIBLE_MS = 280;

const DASHBOARD_PREFIX =
  /^\/(customer|owner|staff|admin|chat|settings|direct-messages|dashboard)(\/|$)/;

function isDashboardPath(pathname: string): boolean {
  return DASHBOARD_PREFIX.test(pathname);
}

function isInternalHref(href: string | null, pathname: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }
  if (href.startsWith('http') && typeof window !== 'undefined') {
    try {
      const url = new URL(href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return href.startsWith('/') && href !== pathname;
}

export default function NavigationProgress() {
  const pathname = usePathname();
  const onDashboard = isDashboardPath(pathname);
  const [active, setActive] = useState(false);
  const startedAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    startedAt.current = Date.now();
    setActive(true);
    document.documentElement.dataset.navigating = 'true';
  }, []);

  const finish = useCallback(() => {
    const elapsed = Date.now() - startedAt.current;
    const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);
    hideTimer.current = setTimeout(() => {
      setActive(false);
      delete document.documentElement.dataset.navigating;
    }, delay);
  }, []);

  useEffect(() => {
    if (onDashboard) {
      setActive(false);
      delete document.documentElement.dataset.navigating;
      return;
    }
    finish();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname, finish, onDashboard]);

  useEffect(() => {
    if (onDashboard) return;
    const onStart = () => start();
    window.addEventListener('navigation:start', onStart);
    return () => window.removeEventListener('navigation:start', onStart);
  }, [start, onDashboard]);

  useEffect(() => {
    if (onDashboard) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest('button, input, textarea, select, [data-skip-nav-progress]')) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || isDashboardPath(href)) return;
      if (!isInternalHref(href, pathname)) return;
      start();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname, start, onDashboard]);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.navigating;
    };
  }, []);

  if (onDashboard) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-[200] h-1 overflow-hidden bg-primary/15 transition-opacity duration-200 pointer-events-none ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={!active}
      >
        <div
          className={`h-full bg-gradient-to-r from-primary via-rose-deep to-accent shadow-rose navigation-progress-bar ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      {active && (
        <div
          className="fixed inset-0 z-[199] pointer-events-none bg-background/20 backdrop-blur-[1px] transition-opacity duration-150"
          aria-hidden
        />
      )}
    </>
  );
}
