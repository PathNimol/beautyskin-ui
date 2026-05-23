'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { userPreferencesApi } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { useTheme } from '@/contexts/ThemeContext';

type NotificationPrefs = {
  lowStock: boolean;
  newOrders: boolean;
  expiryAlerts: boolean;
  reviews: boolean;
  promotions: boolean;
  emailNotifications: boolean;
};

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  lowStock: true,
  newOrders: true,
  expiryAlerts: true,
  reviews: true,
  promotions: true,
  emailNotifications: true,
};

export default function SettingsClient() {
  const { darkMode, setDarkMode, loading: themeLoading } = useTheme();
  const [notifications, setNotifications] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userPreferencesApi
      .get()
      .then((p) => {
        setDarkMode(p.darkMode);
        setNotifications({
          lowStock: p.lowStockAlerts,
          newOrders: p.orderUpdates,
          expiryAlerts: p.expiryAlerts ?? p.lowStockAlerts,
          reviews: p.reviewAlerts ?? true,
          promotions: p.promotions,
          emailNotifications: p.emailNotifications,
        });
      })
      .catch(() => setError('Could not load your saved preferences.'))
      .finally(() => setLoading(false));
  }, [setDarkMode]);

  const persistPreferences = useCallback(
    async (patch: {
      darkMode?: boolean;
      notifications?: Partial<NotificationPrefs>;
    }) => {
      const n = { ...notifications, ...patch.notifications };
      const body = {
        darkMode: patch.darkMode ?? darkMode,
        lowStockAlerts: n.lowStock,
        orderUpdates: n.newOrders,
        expiryAlerts: n.expiryAlerts,
        reviewAlerts: n.reviews,
        promotions: n.promotions,
        emailNotifications: n.emailNotifications,
      };
      await userPreferencesApi.update(body);
    },
    [darkMode, notifications]
  );

  const handleDarkModeToggle = async () => {
    const next = !darkMode;
    setDarkMode(next);
    setSaving(true);
    setError('');
    try {
      await persistPreferences({ darkMode: next });
    } catch (e: unknown) {
      setDarkMode(!next);
      setError(e instanceof ApiError ? e.message : 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await persistPreferences({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: keyof NotificationPrefs) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading || themeLoading) {
    return (
      <div className="max-w-2xl py-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl">
          <Icon name="CheckCircleIcon" size={18} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
            Settings saved successfully!
          </p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
          <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="text-base font-bold text-foreground mb-5">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applies across the app and is saved to your account
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleDarkModeToggle()}
            disabled={saving}
            aria-pressed={darkMode}
            className={`relative w-12 h-6 rounded-full transition-all disabled:opacity-50 ${darkMode ? 'bg-primary' : 'bg-secondary border border-border'}`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-soft transition-all ${darkMode ? 'left-7' : 'left-1'}`}
            />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="text-base font-bold text-foreground mb-1">Notification Preferences</h3>
        <p className="text-xs text-muted-foreground mb-5">
          Control which in-app alerts you receive (bell icon). Important shop actions like revoke
          requests are always delivered.
        </p>
        <div className="space-y-4">
          {[
            {
              key: 'lowStock' as const,
              label: 'Low Stock Alerts',
              desc: 'Get notified when products are running low',
            },
            {
              key: 'newOrders' as const,
              label: 'New Order Notifications',
              desc: 'Receive alerts for new incoming orders',
            },
            {
              key: 'expiryAlerts' as const,
              label: 'Expiry Alerts',
              desc: 'Warnings for products nearing expiry date',
            },
            {
              key: 'reviews' as const,
              label: 'Review Notifications',
              desc: 'Alerts when customers leave product reviews',
            },
            {
              key: 'promotions' as const,
              label: 'Promotion Updates',
              desc: 'Notifications about promotion status changes',
            },
            {
              key: 'emailNotifications' as const,
              label: 'Email Notifications',
              desc: 'Receive copies of important alerts by email when available',
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification(item.key)}
                aria-pressed={notifications[item.key]}
                className={`relative w-12 h-6 rounded-full transition-all ${notifications[item.key] ? 'bg-primary' : 'bg-secondary border border-border'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-soft transition-all ${notifications[item.key] ? 'left-7' : 'left-1'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="text-base font-bold text-foreground mb-5">Platform Information</h3>
        <div className="space-y-3">
          {[
            { label: 'Platform Name', value: 'BS Online Shop' },
            { label: 'Version', value: '2.0.0' },
            { label: 'Environment', value: process.env.NODE_ENV === 'production' ? 'Production' : 'Development' },
            { label: 'Last Updated', value: 'May 2026' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center py-2 border-b border-border last:border-0"
            >
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="w-full py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save notification preferences'}
      </button>
    </div>
  );
}
