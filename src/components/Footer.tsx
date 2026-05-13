import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const footerLinks = [
  { label: 'Products', href: '/login' },
  { label: 'About', href: '/login' },
  { label: 'Offers', href: '/login' },
  { label: 'Dashboard', href: '/admin-dashboard' },
  { label: 'Privacy', href: '/login' },
  { label: 'Terms', href: '/login' },
];

const socialLinks = [
  { icon: 'GlobeAltIcon', label: 'Website', href: '/login' },
  { icon: 'EnvelopeIcon', label: 'Email', href: '/login' },
  { icon: 'PhoneIcon', label: 'Contact', href: '/login' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Left: Logo + Tagline */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2.5">
              <AppLogo size={32} />
              <span className="font-display font-bold text-base text-foreground">BS Online Shop</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Beauty Skin — Premium Korean-inspired skincare for your everyday glow ritual.
            </p>
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-accent hover:border-accent transition-all"
                >
                  <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            © 2026 BS Online Shop — Beauty Skin. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with care for your skin ✨
          </p>
        </div>
      </div>
    </footer>
  );
}