'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import { MOCK_PROMOTIONS } from '@/lib/mock/data';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  paused: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
};

const TYPE_LABELS: Record<string, string> = {
  percentage: 'Percentage Off',
  fixed: 'Fixed Amount',
  free_shipping: 'Free Shipping',
  buy_x_get_y: 'Buy X Get Y',
};

export default function PromotionsClient() {
  const [promotions, setPromotions] = useState(MOCK_PROMOTIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  const filtered = promotions.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const stats = {
    active: promotions.filter(p => p.status === 'active').length,
    totalUses: promotions.reduce((sum, p) => sum + p.usedCount, 0),
    scheduled: promotions.filter(p => p.status === 'scheduled').length,
    expired: promotions.filter(p => p.status === 'expired').length,
  };

  return (
    <DashboardLayout title="Promotions" subtitle="Manage coupons, discounts, and flash sales">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Promos', value: stats.active, icon: 'TagIcon', color: 'bg-green-50 text-green-600' },
          { label: 'Total Uses', value: stats.totalUses, icon: 'UsersIcon', color: 'bg-blue-50 text-blue-600' },
          { label: 'Scheduled', value: stats.scheduled, icon: 'CalendarIcon', color: 'bg-purple-50 text-purple-600' },
          { label: 'Expired', value: stats.expired, icon: 'ClockIcon', color: 'bg-gray-100 text-gray-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={16} />
            </div>
            <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search promotions or codes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'active', 'scheduled', 'expired', 'paused'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                statusFilter === s ? 'bg-primary text-foreground shadow-rose' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
          >
            <Icon name="PlusIcon" size={15} />
            Create
          </button>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-2xl p-12 text-center shadow-card">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="TagIcon" size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No promotions found</p>
          </div>
        ) : filtered.map(promo => {
          const sc = STATUS_STYLES[promo.status];
          const usagePercent = Math.min(100, (promo.usedCount / promo.maxUses) * 100);
          return (
            <div key={promo.id} className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-rose transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{promo.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{TYPE_LABELS[promo.type]}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {promo.status}
                </span>
              </div>

              {/* Coupon Code */}
              <div className="flex items-center gap-2 bg-secondary rounded-xl p-3 mb-4">
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Coupon Code</p>
                  <p className="text-base font-extrabold text-foreground font-mono tracking-widest">{promo.code}</p>
                </div>
                <button
                  onClick={() => copyCode(promo.code)}
                  className="w-8 h-8 bg-card border border-border rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all"
                >
                  <Icon name={copiedCode === promo.code ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14} className={copiedCode === promo.code ? 'text-green-600' : 'text-muted-foreground'} />
                </button>
              </div>

              {/* Value */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-primary/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-extrabold text-rose-deep">
                    {promo.type === 'percentage' ? `${promo.value}%` :
                     promo.type === 'fixed' ? `$${promo.value}` :
                     promo.type === 'free_shipping' ? 'FREE' : `${promo.value}x`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Discount</p>
                </div>
                {promo.minOrder > 0 && (
                  <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
                    <p className="text-sm font-bold text-foreground">${promo.minOrder}</p>
                    <p className="text-[10px] text-muted-foreground">Min Order</p>
                  </div>
                )}
              </div>

              {/* Usage */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-muted-foreground">Usage</span>
                  <span className="text-[10px] font-semibold text-foreground">{promo.usedCount} / {promo.maxUses}</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${usagePercent}%` }} />
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 border-t border-border">
                <span>{promo.startDate}</span>
                <Icon name="ArrowRightIcon" size={10} />
                <span>{promo.endDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all">
              <Icon name="XMarkIcon" size={15} className="text-muted-foreground" />
            </button>
            <h3 className="text-base font-bold text-foreground mb-5">Create Promotion</h3>
            <div className="space-y-4">
              {[
                { label: 'Promotion Name', placeholder: 'e.g. Summer Sale 2026', type: 'text' },
                { label: 'Coupon Code', placeholder: 'e.g. SUMMER20', type: 'text' },
                { label: 'Discount Value', placeholder: 'e.g. 20', type: 'number' },
                { label: 'Minimum Order ($)', placeholder: 'e.g. 50', type: 'number' },
                { label: 'Max Uses', placeholder: 'e.g. 500', type: 'number' },
                { label: 'Start Date', placeholder: '', type: 'date' },
                { label: 'End Date', placeholder: '', type: 'date' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
              >
                Create Promotion
              </button>
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 bg-secondary text-muted-foreground font-semibold rounded-xl hover:text-foreground transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
