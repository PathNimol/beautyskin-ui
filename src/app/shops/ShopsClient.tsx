'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { MOCK_SHOPS } from '@/lib/mock/data';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  suspended: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const PLAN_STYLES: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-600',
  growth: 'bg-blue-50 text-blue-700',
  enterprise: 'bg-purple-50 text-purple-700',
};

export default function ShopsClient() {
  const [shops, setShops] = useState(MOCK_SHOPS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedShop, setSelectedShop] = useState<typeof MOCK_SHOPS[0] | null>(null);

  const filtered = shops.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (shopId: string, status: 'active' | 'pending' | 'suspended') => {
    setShops(prev => prev.map(s => s.id === shopId ? { ...s, status } : s));
    if (selectedShop?.id === shopId) setSelectedShop(prev => prev ? { ...prev, status } : null);
  };

  const stats = {
    total: shops.length,
    active: shops.filter(s => s.status === 'active').length,
    pending: shops.filter(s => s.status === 'pending').length,
    totalRevenue: shops.reduce((sum, s) => sum + s.revenue, 0),
  };

  return (
    <DashboardLayout title="Shops" subtitle="Manage all registered shops on the platform">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Shops', value: stats.total, icon: 'BuildingStorefrontIcon', color: 'bg-blue-50 text-blue-600' },
          { label: 'Active', value: stats.active, icon: 'CheckCircleIcon', color: 'bg-green-50 text-green-600' },
          { label: 'Pending Approval', value: stats.pending, icon: 'ClockIcon', color: 'bg-amber-50 text-amber-600' },
          { label: 'Platform Revenue', value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: 'CurrencyDollarIcon', color: 'bg-primary/20 text-rose-deep' },
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
            placeholder="Search shops or owners..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'active', 'pending', 'suspended'].map(s => (
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
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(shop => {
          const sc = STATUS_STYLES[shop.status];
          return (
            <div
              key={shop.id}
              onClick={() => setSelectedShop(shop)}
              className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-rose transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shrink-0">
                  <AppImage src={shop.logo} alt={shop.logoAlt} width={48} height={48} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{shop.name}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold ${sc.bg} ${sc.text} shrink-0`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {shop.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Owner: {shop.ownerName}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1 inline-block capitalize ${PLAN_STYLES[shop.plan]}`}>
                    {shop.plan}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center mb-4">
                {[
                  { label: 'Revenue', value: `$${(shop.revenue / 1000).toFixed(0)}K` },
                  { label: 'Orders', value: shop.orders.toLocaleString() },
                  { label: 'Products', value: shop.products },
                  { label: 'Customers', value: shop.customers.toLocaleString() },
                ].map(stat => (
                  <div key={stat.label} className="bg-secondary rounded-xl p-2">
                    <p className="text-xs font-extrabold text-foreground">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-[10px] text-muted-foreground">{shop.category}</span>
                <span className="text-[10px] text-muted-foreground">Since {shop.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shop Detail Modal */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSelectedShop(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <button onClick={() => setSelectedShop(null)} className="absolute top-4 right-4 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all">
              <Icon name="XMarkIcon" size={15} className="text-muted-foreground" />
            </button>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border">
                <AppImage src={selectedShop.logo} alt={selectedShop.logoAlt} width={64} height={64} className="object-cover w-full h-full" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{selectedShop.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedShop.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Revenue', value: `$${(selectedShop.revenue / 1000).toFixed(1)}K` },
                { label: 'Orders', value: selectedShop.orders.toLocaleString() },
                { label: 'Products', value: selectedShop.products },
                { label: 'Customers', value: selectedShop.customers.toLocaleString() },
              ].map(stat => (
                <div key={stat.label} className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-5">
              {[
                { label: 'Owner', value: selectedShop.ownerName },
                { label: 'Category', value: selectedShop.category },
                { label: 'Plan', value: selectedShop.plan },
                { label: 'Registered', value: selectedShop.createdAt },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-semibold text-foreground capitalize">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {selectedShop.status !== 'active' && (
                <button onClick={() => updateStatus(selectedShop.id, 'active')} className="flex-1 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-xl hover:bg-green-100 transition-all border border-green-200">
                  Approve
                </button>
              )}
              {selectedShop.status !== 'suspended' && (
                <button onClick={() => updateStatus(selectedShop.id, 'suspended')} className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all border border-red-200">
                  Suspend
                </button>
              )}
              {selectedShop.status !== 'pending' && (
                <button onClick={() => updateStatus(selectedShop.id, 'pending')} className="flex-1 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 transition-all border border-amber-200">
                  Set Pending
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
