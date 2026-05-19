'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';

export default function CustomerAccountClient() {
  const { user, updateProfile } = useMockAuth();
  const ship = user?.shipping;
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    phone: user?.phone ?? '',
    address: ship?.address ?? '',
    city: ship?.city ?? '',
    state: ship?.state ?? '',
    zip: ship?.zip ?? '',
    country: ship?.country ?? 'Cambodia',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      phone: form.phone,
      shipping: {
        firstName: ship?.firstName ?? user?.name.split(' ')[0] ?? '',
        lastName: ship?.lastName ?? user?.name.split(' ').slice(1).join(' ') ?? '',
        ...form,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout title="My Account" subtitle="Profile and shipping details for faster checkout">
      <MotionAccountGrid
        user={user}
        form={form}
        setForm={setForm}
        saved={saved}
        handleSave={handleSave}
      />
    </DashboardLayout>
  );
}

function MotionAccountGrid({
  user,
  form,
  setForm,
  saved,
  handleSave,
}: {
  user: ReturnType<typeof useMockAuth>['user'];
  form: {
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  saved: boolean;
  handleSave: (e: React.FormEvent) => void;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-bold mb-4">Account Information</h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-semibold">{user?.name}</dd>
          </div>
          <MotionAccountEmail user={user} />
          <div>
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-semibold">{user?.joinDate}</dd>
          </div>
        </dl>
        <Link
          href="/customer/products"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground font-semibold rounded-xl hover:bg-rose-deep hover:text-white transition-all"
        >
          <Icon name="ShoppingBagIcon" size={16} />
          Browse all products
        </Link>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4"
      >
        <h2 className="text-lg font-bold">Shipping profile</h2>
        <p className="text-sm text-muted-foreground">
          Used to auto-fill checkout. You can still edit at checkout.
        </p>
        <Field
          label="Phone"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="+855 12 345 678"
        />
        <Field
          label="Address"
          value={form.address}
          onChange={(v) => setForm({ ...form, address: v })}
          placeholder="Street address"
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="City"
            value={form.city}
            onChange={(v) => setForm({ ...form, city: v })}
            placeholder="Phnom Penh"
          />
          <Field
            label="State / Province"
            value={form.state}
            onChange={(v) => setForm({ ...form, state: v })}
            placeholder="State"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="ZIP / Postal"
            value={form.zip}
            onChange={(v) => setForm({ ...form, zip: v })}
            placeholder="12000"
          />
          <Field
            label="Country"
            value={form.country}
            onChange={(v) => setForm({ ...form, country: v })}
            placeholder="Cambodia"
          />
        </div>
        {saved && (
          <p className="text-sm text-green-600 font-medium flex items-center gap-1">
            <Icon name="CheckCircleIcon" size={16} /> Profile saved
          </p>
        )}
        <button type="submit" className="w-full py-3 bg-primary font-bold rounded-xl min-h-[44px]">
          Save profile
        </button>
      </form>
    </div>
  );
}

function MotionAccountEmail({ user }: { user: ReturnType<typeof useMockAuth>['user'] }) {
  return (
    <div>
      <dt className="text-muted-foreground">Email</dt>
      <dd className="font-semibold">{user?.email}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm"
      />
    </div>
  );
}
