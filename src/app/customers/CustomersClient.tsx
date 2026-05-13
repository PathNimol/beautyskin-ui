'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { MOCK_USERS } from '@/lib/mock/data';

const MOCK_CUSTOMERS = MOCK_USERS.filter((u) => u.role === 'buyer').concat([
{ id: 'cust-002', email: 'meilin@email.com', name: 'Mei-Lin Tanaka', role: 'buyer' as const, avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_12681620f-1763300830972.png", avatarAlt: 'Mei-Lin Tanaka', phone: '+1 555-0102', joinDate: 'Jul 5, 2024' },
{ id: 'cust-003', email: 'priya.s@email.com', name: 'Priya Sharma', role: 'buyer' as const, avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1100754ec-1772440845407.png", avatarAlt: 'Priya Sharma', phone: '+1 555-0103', joinDate: 'Aug 12, 2024' },
{ id: 'cust-004', email: 'sophie.w@email.com', name: 'Sophie Williams', role: 'buyer' as const, avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_103b528db-1763293982935.png", avatarAlt: 'Sophie Williams', phone: '+1 555-0104', joinDate: 'Sep 3, 2024' },
{ id: 'cust-005', email: 'aiko.n@email.com', name: 'Aiko Nakamura', role: 'buyer' as const, avatar: "https://images.unsplash.com/photo-1668049221607-1f2df20621cc", avatarAlt: 'Aiko Nakamura', phone: '+1 555-0105', joinDate: 'Oct 18, 2024' },
{ id: 'cust-006', email: 'fatima.ah@email.com', name: 'Fatima Al-Hassan', role: 'buyer' as const, avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10b618970-1772939771929.png", avatarAlt: 'Fatima Al-Hassan', phone: '+1 555-0106', joinDate: 'Nov 7, 2024' }]
);

export default function CustomersClient() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof MOCK_CUSTOMERS[0] | null>(null);

  const filtered = MOCK_CUSTOMERS.filter((c) =>
  c.name.toLowerCase().includes(search.toLowerCase()) ||
  c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Customers" subtitle={`${MOCK_CUSTOMERS.length} registered customers`}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
        { label: 'Total Customers', value: MOCK_CUSTOMERS.length, icon: 'UsersIcon', color: 'bg-blue-50 text-blue-600' },
        { label: 'Active This Month', value: 4, icon: 'UserCircleIcon', color: 'bg-green-50 text-green-600' },
        { label: 'New This Week', value: 2, icon: 'UserPlusIcon', color: 'bg-purple-50 text-purple-600' },
        { label: 'Avg Orders', value: '3.2', icon: 'ShoppingBagIcon', color: 'bg-primary/20 text-rose-deep' }].
        map((stat) =>
        <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <Icon name={stat.icon as Parameters<typeof Icon>[0]['name']} size={16} />
            </div>
            <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose">
          <Icon name="ArrowDownTrayIcon" size={15} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Joined</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) =>
              <tr key={customer.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-border shrink-0">
                        <AppImage src={customer.avatar} alt={customer.avatarAlt} width={36} height={36} className="object-cover w-full h-full" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{customer.email}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">{customer.phone}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">{customer.joinDate}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all mx-auto">
                    
                      <Icon name="EyeIcon" size={14} className="text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 right-4 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all">
              <Icon name="XMarkIcon" size={15} className="text-muted-foreground" />
            </button>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border">
                <AppImage src={selectedCustomer.avatar} alt={selectedCustomer.avatarAlt} width={64} height={64} className="object-cover w-full h-full" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{selectedCustomer.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-lg mt-1 inline-block">Verified Customer</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
            { label: 'Phone', value: selectedCustomer.phone },
            { label: 'Member Since', value: selectedCustomer.joinDate }].
            map((item) =>
            <div key={item.label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-semibold text-foreground">{item.value}</span>
                </div>
            )}
            </div>
          </div>
        </div>
      }
    </DashboardLayout>);

}