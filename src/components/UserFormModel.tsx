'use client';
// src/components/UserFormModal.tsx
// (your file is named UserFormModel.tsx — rename to UserFormModal.tsx to match imports)

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import type { ManagedUser, UserRole, UserStatus } from '@/types/userManagement';

const ROLES: UserRole[] = ['Customer', 'Owner', 'Staff', 'Admin'];
const STATUSES: UserStatus[] = ['active', 'inactive', 'suspended'];

interface Props {
  mode: 'create' | 'edit';
  user?: ManagedUser | null;
  lockedRole?: UserRole;
  shops?: { id: string; name: string }[];
  onSave: (data: Partial<ManagedUser>) => void;
  onClose: () => void;
}

export default function UserFormModal({
  mode,
  user,
  lockedRole,
  shops = [],
  onSave,
  onClose,
}: Props) {
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    role: lockedRole ?? user?.role ?? 'Customer',
    status: (user?.status ?? 'active') as UserStatus,
    shopId: user?.shopId ?? '',
    password: '',
    confirmPw: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (mode === 'create') {
      if (form.password.length < 6) e.password = 'Min 6 characters';
      if (form.password !== form.confirmPw) e.confirmPw = 'Passwords do not match';
    }
    if (!lockedRole && (form.role === 'Owner' || form.role === 'Staff') && !form.shopId) {
      e.shopId = 'Assign a shop for this role';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSave({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        role: form.role as UserRole,
        status: form.status as UserStatus,
        shopId: form.shopId || undefined,
        shopName: shops.find((s) => s.id === form.shopId)?.name,
        ...(mode === 'create'
          ? { password: form.password, confirmPassword: form.confirmPw }
          : {}),
      });
    }, 600);
  };

  const needsShop = !lockedRole && (form.role === 'Owner' || form.role === 'Staff');

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="font-extrabold text-foreground">
              {mode === 'create' ? 'Create New User' : `Edit ${user?.firstName} ${user?.lastName}`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === 'create'
                ? 'Fill in the details to create a new account'
                : 'Update account details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all"
            aria-label="Close"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            {(['firstName', 'lastName'] as const).map((key) => (
              <div key={key}>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {key === 'firstName' ? 'First Name' : 'Last Name'}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={key === 'firstName' ? 'Emma' : 'Rodriguez'}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Phone (optional)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+1 555-0000"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Role
              </label>
              {lockedRole ? (
                <div className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed">
                  {lockedRole}
                </div>
              ) : (
                <select
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shop assignment */}
          {needsShop && shops.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Assign to Shop
              </label>
              <select
                value={form.shopId}
                onChange={(e) => set('shopId', e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="">— Select a shop —</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.shopId && <p className="text-xs text-red-500 mt-1">{errors.shopId}</p>}
            </div>
          )}

          {/* Password (create only) */}
          {mode === 'create' && (
            <>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 pr-11 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name={showPw ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={form.confirmPw}
                  onChange={(e) => set('confirmPw', e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {errors.confirmPw && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPw}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                {mode === 'create' ? 'Creating…' : 'Saving…'}
              </>
            ) : mode === 'create' ? (
              'Create User'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
