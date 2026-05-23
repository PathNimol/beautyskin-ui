'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';

export default function StaffAccountClient() {
  const { user, updateProfile } = useMockAuth();
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold">Staff profile</h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-semibold">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-semibold">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-semibold">Staff</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Shop ID</dt>
            <dd className="font-mono text-xs text-muted-foreground">{user?.shopId ?? '—'}</dd>
          </div>
        </dl>
        <Link
          href="/staff/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-foreground transition-all hover:bg-rose-deep hover:text-white"
        >
          <Icon name="Squares2X2Icon" size={16} />
          Back to dashboard
        </Link>
      </div>

      <form
        onSubmit={(e) => void handleSave(e)}
        className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h2 className="text-lg font-bold">Contact</h2>
        <p className="text-sm text-muted-foreground">Update your phone number for shop communications.</p>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+855 12 345 678"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
        </div>
        {saved && (
          <p className="flex items-center gap-1 text-sm font-medium text-green-600">
            <Icon name="CheckCircleIcon" size={16} /> Saved
          </p>
        )}
        <button type="submit" className="min-h-[44px] w-full rounded-xl bg-primary py-3 font-bold">
          Save
        </button>
      </form>
    </div>
  );
}
