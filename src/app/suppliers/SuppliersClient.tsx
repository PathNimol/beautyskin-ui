'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { MOCK_SUPPLIERS } from '@/lib/mock/data';

export default function SuppliersClient() {
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<typeof MOCK_SUPPLIERS[0] | null>(null);

  const filtered = MOCK_SUPPLIERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Suppliers" subtitle={`${MOCK_SUPPLIERS.length} registered suppliers`}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Suppliers', value: MOCK_SUPPLIERS.length, icon: 'TruckIcon', color: 'bg-blue-50 text-blue-600' },
          { label: 'Active', value: MOCK_SUPPLIERS.filter(s => s.status === 'active').length, icon: 'CheckCircleIcon', color: 'bg-green-50 text-green-600' },
          { label: 'Total Spent', value: `$${(MOCK_SUPPLIERS.reduce((sum, s) => sum + s.totalSpent, 0) / 1000).toFixed(0)}K`, icon: 'CurrencyDollarIcon', color: 'bg-primary/20 text-rose-deep' },
          { label: 'Total Orders', value: MOCK_SUPPLIERS.reduce((sum, s) => sum + s.totalOrders, 0), icon: 'ClipboardDocumentListIcon', color: 'bg-accent/20 text-gold-deep' },
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
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose">
          <Icon name="PlusIcon" size={15} />
          Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(supplier => (
          <div
            key={supplier.id}
            onClick={() => setSelectedSupplier(supplier)}
            className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-rose transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shrink-0">
                <AppImage src={supplier.logo} alt={supplier.logoAlt} width={48} height={48} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{supplier.name}</p>
                <p className="text-xs text-muted-foreground">{supplier.contactPerson}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${supplier.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {supplier.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{supplier.country}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-secondary rounded-xl p-2">
                <p className="text-sm font-extrabold text-foreground">{supplier.totalOrders}</p>
                <p className="text-[9px] text-muted-foreground">Orders</p>
              </div>
              <div className="bg-secondary rounded-xl p-2">
                <p className="text-sm font-extrabold text-foreground">${(supplier.totalSpent / 1000).toFixed(0)}K</p>
                <p className="text-[9px] text-muted-foreground">Spent</p>
              </div>
              <div className="bg-secondary rounded-xl p-2">
                <p className="text-sm font-extrabold text-foreground">{supplier.rating}★</p>
                <p className="text-[9px] text-muted-foreground">Rating</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Last order: {supplier.lastOrder}</span>
              <span className="text-[10px] font-semibold text-accent">{supplier.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSelectedSupplier(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <button onClick={() => setSelectedSupplier(null)} className="absolute top-4 right-4 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all">
              <Icon name="XMarkIcon" size={15} className="text-muted-foreground" />
            </button>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border">
                <AppImage src={selectedSupplier.logo} alt={selectedSupplier.logoAlt} width={64} height={64} className="object-cover w-full h-full" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{selectedSupplier.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedSupplier.category}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1 inline-block ${selectedSupplier.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {selectedSupplier.status}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Contact Person', value: selectedSupplier.contactPerson },
                { label: 'Email', value: selectedSupplier.email },
                { label: 'Phone', value: selectedSupplier.phone },
                { label: 'Address', value: `${selectedSupplier.address}, ${selectedSupplier.country}` },
                { label: 'Member Since', value: selectedSupplier.joinDate },
                { label: 'Last Order', value: selectedSupplier.lastOrder },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <span className="text-xs text-muted-foreground shrink-0">{item.label}</span>
                  <span className="text-xs font-semibold text-foreground text-right">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
              <div className="text-center bg-secondary rounded-xl p-3">
                <p className="text-lg font-extrabold text-foreground">{selectedSupplier.totalOrders}</p>
                <p className="text-[10px] text-muted-foreground">Orders</p>
              </div>
              <div className="text-center bg-secondary rounded-xl p-3">
                <p className="text-lg font-extrabold text-foreground">${(selectedSupplier.totalSpent / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-muted-foreground">Total Spent</p>
              </div>
              <div className="text-center bg-secondary rounded-xl p-3">
                <p className="text-lg font-extrabold text-foreground">{selectedSupplier.rating}★</p>
                <p className="text-[10px] text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
