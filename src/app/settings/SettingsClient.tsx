'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { userPreferencesApi } from '@/lib/api';

export default function SettingsClient() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newOrders: true,
    expiryAlerts: true,
    reviews: false,
    promotions: true,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userPreferencesApi.get()
      .then((p) => {
        setDarkMode(p.darkMode);
        setNotifications({
          lowStock: p.lowStockAlerts,
          newOrders: p.orderUpdates,
          expiryAlerts: p.lowStockAlerts,
          reviews: false,
          promotions: p.promotions,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await userPreferencesApi.update({
        darkMode,
        lowStockAlerts: notifications.lowStock,
        orderUpdates: notifications.newOrders,
        promotions: notifications.promotions,
        emailNotifications: true,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent
    }
  };

  return (
      <div className="max-w-2xl space-y-6">
        {/* Success */}
        {saved && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <Icon name="CheckCircleIcon" size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-semibold">Settings saved successfully!</p>
          </div>
        )}

        {/* Appearance */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="text-base font-bold text-foreground mb-5">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle between light and dark theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-all ${darkMode ? 'bg-primary' : 'bg-secondary border border-border'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-soft transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="text-base font-bold text-foreground mb-5">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when products are running low' },
              { key: 'newOrders', label: 'New Order Notifications', desc: 'Receive alerts for new incoming orders' },
              { key: 'expiryAlerts', label: 'Expiry Alerts', desc: 'Warnings for products nearing expiry date' },
              { key: 'reviews', label: 'Review Notifications', desc: 'Alerts when customers leave product reviews' },
              { key: 'promotions', label: 'Promotion Updates', desc: 'Notifications about promotion status changes' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                  className={`relative w-12 h-6 rounded-full transition-all ${notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-secondary border border-border'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-soft transition-all ${notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Info */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="text-base font-bold text-foreground mb-5">Platform Information</h3>
          <div className="space-y-3">
            {[
              { label: 'Platform Name', value: 'BS Online Shop' },
              { label: 'Version', value: '2.0.0' },
              { label: 'Environment', value: 'Production' },
              { label: 'Last Updated', value: 'May 12, 2026' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
        >
          Save Settings
        </button>
      </div>
  );
}
