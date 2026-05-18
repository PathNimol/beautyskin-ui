import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { MockAuthProvider } from '@/contexts/MockAuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'BS Online Shop — Premium Beauty & Skincare',
  description:
    'Discover premium Korean-inspired skincare at BS Online Shop. Shop moisturizers, serums, cleansers and more. Free shipping on orders over $50.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
  openGraph: {
    title: 'BS Online Shop — Premium Beauty & Skincare',
    description: 'Premium Korean-inspired skincare. Shop moisturizers, serums, cleansers and more.',
    images: [{ url: '/assets/images/app_logo.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <MockAuthProvider>{children}</MockAuthProvider>
      </body>
    </html>
  );
}
