'use client';
// src/components/ConfirmModal.tsx

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

type Variant = 'danger' | 'warning' | 'info';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: Variant;
  onConfirm: () => void;
  onClose: () => void;
}

const VARIANT_STYLES: Record<
  Variant,
  { icon: string; bg: string; btn: string; iconColor: string }
> = {
  danger: {
    icon: 'TrashIcon',
    bg: 'bg-red-50',
    btn: 'bg-red-600 hover:bg-red-700 text-white',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: 'ExclamationTriangleIcon',
    bg: 'bg-amber-50',
    btn: 'bg-amber-500 hover:bg-amber-600 text-white',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: 'KeyIcon',
    bg: 'bg-blue-50',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    iconColor: 'text-blue-500',
  },
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const s = VARIANT_STYLES[variant];

  const handle = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div
          className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center mx-auto mb-5`}
        >
          <Icon
            name={s.icon as Parameters<typeof Icon>[0]['name']}
            size={26}
            className={s.iconColor}
          />
        </div>
        <h3 className="text-lg font-extrabold text-foreground text-center mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${s.btn}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
