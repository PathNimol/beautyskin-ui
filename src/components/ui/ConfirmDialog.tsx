'use client';

import Icon from '@/components/ui/AppIcon';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: Parameters<typeof Icon>[0]['name'];
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    confirmBtn: 'bg-red-500 hover:bg-red-600 text-white',
  },
  warning: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  info: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon = 'ExclamationTriangleIcon',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const styles = VARIANT_STYLES[variant];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styles.iconBg}`}
            >
              <Icon name={icon} size={15} className={styles.iconColor} />
            </div>
            <h3 className="font-bold text-foreground text-sm">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="XMarkIcon" size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-border flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-secondary border border-border text-foreground hover:bg-primary/10 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${styles.confirmBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
