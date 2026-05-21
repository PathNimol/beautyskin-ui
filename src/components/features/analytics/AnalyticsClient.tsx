'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useAnalyticsSummary } from '@/hooks/useApiLists';
import { useRealtimeOrders, useRealtimeInventory, useRealtimeShops } from '@/hooks/useRealtimeData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface StaffActivity {
  name: string;
  role: string;
  shop: string;
  status: string;
  created_at: string;
}

const COLORS = ['#e11d48', '#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-soft">
        <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name === 'revenue' || p.name === 'Revenue' ? `$${Number(p.value).toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsClient() {
  const { role } = useMockAuth();
  const { data: analyticsData, loading: analyticsLoading } = useAnalyticsSummary('30d');
  const { orders, loading: ordersLoading } = useRealtimeOrders();
  const { inventory } = useRealtimeInventory();
  const { shops } = useRealtimeShops();

  const [staffActivity, setStaffActivity] = useState<StaffActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'revenue' | 'orders' | 'customers' | 'staff'>('revenue');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const staff = analyticsData?.staffActivity;
    if (Array.isArray(staff)) {
      setStaffActivity(
        staff.map((s: Record<string, unknown>) => ({
          name: String(s.name || ''),
          role: String(s.role || ''),
          shop: String(s.shop || 'N/A'),
          status: String(s.status || ''),
          created_at: String(s.createdAt || s.created_at || ''),
        }))
      );
    }
  }, [analyticsData]);

  const totalRevenue = orders.filter(o => o.pay_status === 'Paid').reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.order_status === 'Delivered').length;
  const pendingOrders = orders.filter(o => o.order_status === 'Pending').length;
  const activeShops = shops.filter(s => s.shop_status === 'active').length;
  const lowStockCount = inventory.filter(i => i.inv_status === 'low' || i.inv_status === 'critical' || i.inv_status === 'out_of_stock').length;

  const dailyRevenue: DailyRevenue[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayOrders = orders.filter(o => o.created_at?.startsWith(dateStr));
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayOrders.filter(o => o.pay_status === 'Paid').reduce((s, o) => s + Number(o.total), 0),
      orders: dayOrders.length,
    };
  });

  const orderStatusData = Object.entries(
    orders.reduce((acc, o) => {
      acc[o.order_status] = (acc[o.order_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const customerGrowth = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const cumOrders = orders.filter(o => o.created_at <= dateStr + 'T23:59:59Z');
    const uniqueCustomers = new Set(cumOrders.map(o => o.customer_email).filter(Boolean)).size;
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      customers: uniqueCustomers,
    };
  });

  const exportCSV = useCallback(() => {
    setExporting(true);
    try {
      const rows = [
        ['Date', 'Revenue ($)', 'Orders', 'Unique Customers'],
        ...dailyRevenue.map((d, i) => [d.date, d.revenue.toFixed(2), d.orders, customerGrowth[i]?.customers || 0]),
        [],
        ['Summary'],
        ['Total Revenue', totalRevenue.toFixed(2)],
        ['Total Orders', totalOrders],
        ['Delivered Orders', deliveredOrders],
        ['Pending Orders', pendingOrders],
        ['Active Shops', activeShops],
        ['Low Stock Items', lowStockCount],
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bs-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    setExporting(false);
  }, [dailyRevenue, customerGrowth, totalRevenue, totalOrders, deliveredOrders, pendingOrders, activeShops, lowStockCount]);

  const kpiCards = [
    { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, icon: 'CurrencyDollarIcon', color: 'bg-rose-50 text-rose-600', change: '+12.5%', positive: true },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: 'ClipboardDocumentListIcon', color: 'bg-blue-50 text-blue-600', change: `${pendingOrders} pending`, positive: true },
    { label: 'Active Shops', value: activeShops.toString(), icon: 'BuildingStorefrontIcon', color: 'bg-amber-50 text-amber-600', change: `${shops.length} total`, positive: true },
    { label: 'Low Stock Items', value: lowStockCount.toString(), icon: 'ExclamationTriangleIcon', color: lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600', change: lowStockCount > 0 ? 'Action needed' : 'All good', positive: lowStockCount === 0 },
  ];

  const tabs = [
    { id: 'revenue' as const, label: 'Revenue', icon: 'CurrencyDollarIcon' },
    { id: 'orders' as const, label: 'Orders', icon: 'ClipboardDocumentListIcon' },
    { id: 'customers' as const, label: 'Customers', icon: 'UsersIcon' },
    { id: 'staff' as const, label: 'Staff Activity', icon: 'UserGroupIcon' },
  ];

  if (role !== 'admin' && role !== 'owner') {
    return (
      <DashboardLayout title="Analytics" subtitle="Platform analytics and insights">
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Icon name="LockClosedIcon" size={40} className="opacity-20 mb-3" />
          <p className="text-sm font-medium">Access restricted to admins and owners</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics" subtitle="Real-time platform analytics and insights">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">Live Data</span>
          {ordersLoading && <span className="text-xs text-blue-500 ml-2">Updating...</span>}
        </div>
        <button
          onClick={exportCSV}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-foreground rounded-xl text-sm font-semibold hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60"
        >
          <Icon name="ArrowDownTrayIcon" size={15} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-rose transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon name={card.icon as Parameters<typeof Icon>[0]['name']} size={18} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${card.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-primary text-foreground shadow-rose' : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Icon name={tab.icon as Parameters<typeof Icon>[0]['name']} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-4">Daily Revenue (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#e11d48" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-4">Revenue by Shop</h3>
            <div className="space-y-3">
              {shops.slice(0, 5).map((shop, i) => (
                <div key={shop.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground truncate max-w-[120px]">{shop.name}</span>
                    <span className="text-muted-foreground">${Number(shop.revenue).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (Number(shop.revenue) / Math.max(...shops.map(s => Number(s.revenue)), 1)) * 100)}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
              {shops.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No shop data</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-4">Daily Order Count</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-4">Order Status Distribution</h3>
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {orderStatusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p className="text-sm">No order data</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-4">Customer Growth (7 Days)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="customers" name="Customers" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <h3 className="font-bold text-foreground mb-4">Top Customers by Order Value</h3>
            <div className="space-y-3">
              {[...orders]
                .sort((a, b) => Number(b.total) - Number(a.total))
                .slice(0, 8)
                .map((order, i) => (
                  <div key={order.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{order.customer_name}</p>
                      <p className="text-[10px] text-muted-foreground">{order.shop_name}</p>
                    </div>
                    <span className="text-xs font-bold text-rose-deep">${Number(order.total).toFixed(2)}</span>
                  </div>
                ))}
              {orders.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No order data</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Staff Activity</h3>
            <span className="text-xs text-muted-foreground">{staffActivity.length} staff members</span>
          </div>
          <div className="divide-y divide-border">
            {staffActivity.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p className="text-sm">No staff data available</p>
              </div>
            ) : (
              staffActivity.map((s, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/30 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Icon name="UserIcon" size={16} className="text-rose-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.role}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${s.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.status}
                  </span>
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
