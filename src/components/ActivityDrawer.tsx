'use client';
// src/components/ActivityDrawer.tsx

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import type { ManagedUser, ActivityLog } from '@/types/userManagement';
import { STATUS_STYLES, ROLE_STYLES } from '@/types/userManagement';

interface Props {
  user: ManagedUser;
  onClose: () => void;
  onResetPassword: (user: ManagedUser) => void;
}

export default function ActivityDrawer({ user, onClose, onResetPassword }: Props) {
  return (
    <div className="fixed inset-0 z-[300] flex justify-end">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card border-l border-border h-full flex flex-col shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-extrabold text-foreground text-sm">User Activity</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all"
            aria-label="Close"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        {/* Profile summary */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-extrabold text-rose-deep">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-bold text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${STATUS_STYLES[user.status]}`}
            >
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${ROLE_STYLES[user.role]}`}
            >
              {user.role}
            </span>
            {user.shopName && (
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                {user.shopName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Joined', value: user.joinedAt },
              { label: 'Last active', value: user.lastActive },
              { label: 'Phone', value: user.phone ?? '—' },
            ].map((row) => (
              <div key={row.label} className="bg-secondary/60 rounded-xl p-2.5">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold mb-0.5">
                  {row.label}
                </p>
                <p className="font-semibold text-foreground">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div className="px-5 py-4 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Activity Log
          </p>
          {user.activityLog.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity recorded</p>
          ) : (
            <div className="flex flex-col gap-3">
              {user.activityLog.map((log: ActivityLog, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    {i < user.activityLog.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-semibold text-foreground">{log.action}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{log.timestamp}</p>
                    {log.detail && (
                      <p className="text-[11px] text-muted-foreground italic mt-0.5">
                        {log.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset password CTA */}
        <div className="px-5 pb-6 pt-3 border-t border-border">
          <button
            onClick={() => onResetPassword(user)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
          >
            <Icon name="KeyIcon" size={16} />
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}
