'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { IconType } from 'react-icons';

export type OAuthProvider = 'google' | 'facebook' | 'tiktok';

interface SocialAuthButtonsProps {
  onProvider: (provider: OAuthProvider) => Promise<void>;
  disabled?: boolean;
}

const PROVIDERS: {
  id: OAuthProvider;
  label: string;
  icon: IconType;
  className: string;
}[] = [
  {
    id: 'google',
    label: 'Continue with Google',
    icon: FcGoogle,
    className: 'bg-white border-border text-foreground hover:bg-secondary',
  },
  {
    id: 'facebook',
    label: 'Continue with Facebook',
    icon: FaFacebook,
    className: 'bg-[#1877F2] border-[#1877F2] text-white hover:bg-[#166FE5]',
  },
  {
    id: 'tiktok',
    label: 'Continue with TikTok',
    icon: FaTiktok,
    className: 'bg-[#010101] border-[#010101] text-white hover:bg-[#222]',
  },
];

export default function SocialAuthButtons({ onProvider, disabled }: SocialAuthButtonsProps) {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  const handle = async (provider: OAuthProvider) => {
    setLoading(provider);
    try {
      await onProvider(provider);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {PROVIDERS.map((p) => {
          const ProviderIcon = p.icon;

          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled || !!loading}
              onClick={() => handle(p.id)}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-xl text-sm font-semibold transition-all disabled:opacity-60 min-h-[48px] ${p.className}`}
            >
              {loading === p.id ? <MotionSpinner /> : <ProviderIcon size={18} />}

              {p.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
function MotionSpinner() {
  return (
    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
  );
}
