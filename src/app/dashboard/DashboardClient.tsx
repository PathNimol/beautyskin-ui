'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useRealtimeOrders, useRealtimeInventory, useRealtimeShops } from '@/hooks/useRealtimeData';
import { useShopDashboard } from '@/hooks/useApiLists';
import { supplierPurchasesApi } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const WEEKLY_SALES = [
  { day: 'Mon', sales: 1240, orders: 18 },
  { day: 'Tue', sales: 980, orders: 14 },
  { day: 'Wed', sales: 1560, orders: 22 },
  { day: 'Thu', sales: 1120, orders: 16 },
  { day: 'Fri', sales: 1890, orders: 27 },
  { day: 'Sat', sales: 2340, orders: 34 },
  { day: 'Sun', sales: 1780, orders: 25 },
];

const ORDER_STATUS_COLORS: Record<string, string> = {
  Delivered: '#22c55e',
  Shipping: '#3b82f6',
  Packing: '#8b5cf6',
  Confirmed: '#06b6d4',
  Pending: '#f59e0b',
  Cancelled: '#ef4444',
  Returned: '#6b7280',
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-soft">
        <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name === 'sales' ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function KPICard({
  label,
  value,
  change,
  positive,
  icon,
  color,
  sublabel,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-rose transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={18} />
        </div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-lg ${positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
        >
          {change}
        </span>
      </div>
      <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sublabel}</p>}
    </div>
  );
}

export default function DashboardClient() {
  const { role, user } = useMockAuth();
  const { data: shopDash } = useShopDashboard();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'shops'>('overview');
  const [purchasesTotal, setPurchasesTotal] = useState(0);

  const { orders, loading: ordersLoading } = useRealtimeOrders();
  const { inventory, loading: inventoryLoading, lowStockAlerts } = useRealtimeInventory();
  const { shops, loading: shopsLoading } = useRealtimeShops();

  const isLoading = ordersLoading || inventoryLoading || shopsLoading;

  const fetchPurchasesTotal = useCallback(async () => {
    try {
      const page = await supplierPurchasesApi.list(user?.shopId, { status: 'RECEIVED' });
      setPurchasesTotal((page.content || []).reduce((s, r) => s + Number(r.total || 0), 0));
    } catch {
      /* ignore */
    }
  }, [user?.shopId]);

  useEffect(() => {
    fetchPurchasesTotal();
  }, [fetchPurchasesTotal]);

  const dashRevenue = shopDash?.revenue != null ? Number(shopDash.revenue) : null;

  const liveRevenue = orders
    .filter((o) => o.pay_status === 'Paid')
    .reduce((s, o) => s + Number(o.total), 0);
  const livePendingOrders = orders.filter((o) => o.order_status === 'Pending').length;
  const liveLowStock = inventory.filter(
    (i) => i.inv_status === 'low' || i.inv_status === 'critical' || i.inv_status === 'out_of_stock'
  ).length;
  const liveActiveShops = shops.filter((s) => s.shop_status === 'active').length;

  const orderStatusData = Object.entries(
    orders.reduce(
      (acc, o) => {
        acc[o.order_status] = (acc[o.order_status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  ).map(([name, value]) => ({ name, value }));

  // Top 10 highest amount orders
  const top10Orders = [...orders].sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 10);

  // Admin KPIs
  const adminKPIs = [
    {
      label: 'Total Revenue',
      value: `$${(liveRevenue / 1000).toFixed(1)}K`,
      change: '+12.5%',
      positive: true,
      icon: 'CurrencyDollarIcon',
      color: 'bg-primary/20 text-rose-deep',
      sublabel: 'All shops combined',
    },
    {
      label: 'Active Shops',
      value: `${liveActiveShops}`,
      change: `${shops.length} total`,
      positive: true,
      icon: 'BuildingStorefrontIcon',
      color: 'bg-accent/20 text-gold-deep',
      sublabel: `${shops.filter((s) => s.shop_status === 'pending').length} pending approval`,
    },
    {
      label: 'Total Orders',
      value: orders.length.toLocaleString(),
      change: `${livePendingOrders} pending`,
      positive: true,
      icon: 'ClipboardDocumentListIcon',
      color: 'bg-blue-50 text-blue-600',
      sublabel: 'Platform-wide',
    },
    {
      label: 'Total Products',
      value: String(shopDash?.products ?? inventory.length),
      change: `${liveLowStock} low stock`,
      positive: liveLowStock === 0,
      icon: 'ArchiveBoxIcon',
      color: 'bg-purple-50 text-purple-600',
      sublabel: 'Across all shops',
    },
    {
      label: 'Total Customers',
      value: '9,661',
      change: '+18.7%',
      positive: true,
      icon: 'UsersIcon',
      color: 'bg-green-50 text-green-600',
      sublabel: 'Registered buyers',
    },
    {
      label: 'Total Suppliers',
      value: purchasesTotal > 0 ? `$${(purchasesTotal / 1000).toFixed(1)}K` : '—',
      change: 'Active',
      positive: true,
      icon: 'TruckIcon',
      color: 'bg-amber-50 text-amber-600',
      sublabel: 'Platform suppliers',
    },
    {
      label: 'Total Categories',
      value: '8',
      change: 'Skincare',
      positive: true,
      icon: 'TagIcon',
      color: 'bg-rose-50 text-rose-600',
      sublabel: 'Product categories',
    },
    {
      label: 'Supplier Spend',
      value: `$${(purchasesTotal / 1000).toFixed(1)}K`,
      change: 'Received',
      positive: true,
      icon: 'ShoppingCartIcon',
      color: 'bg-indigo-50 text-indigo-600',
      sublabel: 'Total restocking cost',
    },
  ];

  // Owner KPIs
  const ownerKPIs = [
    {
      label: 'Shop Revenue',
      value: `$${(liveRevenue / 1000).toFixed(1)}K`,
      change: '+8.3%',
      positive: true,
      icon: 'CurrencyDollarIcon',
      color: 'bg-primary/20 text-rose-deep',
      sublabel: 'This month',
    },
    {
      label: 'Total Orders',
      value: orders.length.toLocaleString(),
      change: `${livePendingOrders} pending`,
      positive: true,
      icon: 'ClipboardDocumentListIcon',
      color: 'bg-blue-50 text-blue-600',
      sublabel: 'Your shop',
    },
    {
      label: 'Products',
      value: String(shopDash?.products ?? '—'),
      change: `${liveLowStock} alerts`,
      positive: liveLowStock === 0,
      icon: 'ArchiveBoxIcon',
      color: 'bg-purple-50 text-purple-600',
      sublabel: 'In your shop',
    },
    {
      label: 'Low Stock',
      value: `${liveLowStock}`,
      change: liveLowStock > 0 ? 'Action needed' : 'All good',
      positive: liveLowStock === 0,
      icon: 'ExclamationTriangleIcon',
      color: 'bg-amber-50 text-amber-600',
      sublabel: 'Items to restock',
    },
  ];

  // Staff KPIs
  const staffKPIs = [
    {
      label: "Today\'s Orders",
      value: orders
        .filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString())
        .length.toLocaleString(),
      change: 'Today',
      positive: true,
      icon: 'ClipboardDocumentListIcon',
      color: 'bg-blue-50 text-blue-600',
      sublabel: 'New orders',
    },
    {
      label: 'Pending Orders',
      value: `${livePendingOrders}`,
      change: 'Need action',
      positive: livePendingOrders === 0,
      icon: 'ClockIcon',
      color: 'bg-amber-50 text-amber-600',
      sublabel: 'Awaiting processing',
    },
    {
      label: 'Low Stock Items',
      value: `${liveLowStock}`,
      change: liveLowStock > 0 ? 'Alert' : 'OK',
      positive: liveLowStock === 0,
      icon: 'ExclamationTriangleIcon',
      color: 'bg-red-50 text-red-600',
      sublabel: 'Need restocking',
    },
    {
      label: 'Inventory Items',
      value: inventory.length.toLocaleString(),
      change: 'Tracked',
      positive: true,
      icon: 'CubeIcon',
      color: 'bg-green-50 text-green-600',
      sublabel: 'Total SKUs',
    },
  ];

  const kpis = role === 'admin' ? adminKPIs : role === 'owner' ? ownerKPIs : staffKPIs;

  return (
    <DashboardLayout
      title={
        role === 'admin'
          ? 'Platform Dashboard'
          : role === 'owner'
            ? 'Shop Dashboard'
            : 'Staff Dashboard'
      }
      subtitle={
        role === 'admin'
          ? 'Full platform analytics & control'
          : role === 'owner'
            ? `Managing ${user?.shopId ? 'your shop' : 'shop'}`
            : `Welcome Back, ${user?.name}`
      }
    >
      {isLoading && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl w-fit">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-blue-700 font-medium">Loading live data...</span>
        </div>
      )}

      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-muted-foreground font-medium">Live data from Supabase</span>
      </div>

      {/* KPI Grid */}
      <div
        className={`grid gap-4 mb-8 ${role === 'admin' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}
      >
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'orders', 'shops'] as const)
          .filter((t) => role === 'admin' || t !== 'shops')
          .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-primary text-foreground shadow-rose'
                  : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {tab === 'overview' ? '📊 Overview' : tab === 'orders' ? '📦 Orders' : '🏪 Shops'}
            </button>
          ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Sales Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-foreground">Weekly Sales</h3>
                <p className="text-xs text-muted-foreground mt-0.5">All shops combined</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-700 font-semibold">Live</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WEEKLY_SALES} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="var(--primary)" radius={[6, 6, 0, 0]} name="sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-1">Order Status</h3>
            <p className="text-xs text-muted-foreground mb-4">Live distribution</p>
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ORDER_STATUS_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No order data</p>
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                  <Icon name="ExclamationTriangleIcon" size={16} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Low Stock Alerts</h3>
                  <p className="text-xs text-muted-foreground">
                    {lowStockAlerts.length} items need attention
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {lowStockAlerts.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.product_name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-red-600">{item.current_stock} left</p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.inv_status === 'out_of_stock'
                            ? 'bg-red-100 text-red-700'
                            : item.inv_status === 'critical'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.inv_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div
            className={`bg-card border border-border rounded-2xl p-6 ${lowStockAlerts.length > 0 ? '' : 'lg:col-span-1'}`}
          >
            <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {role === 'admin' &&
                [
                  {
                    label: 'Manage Shops',
                    href: '/shops',
                    icon: 'BuildingStorefrontIcon',
                    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                  },
                  {
                    label: 'View Reports',
                    href: '/reports',
                    icon: 'ChartBarIcon',
                    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                  },
                  {
                    label: 'All Orders',
                    href: '/orders',
                    icon: 'ClipboardDocumentListIcon',
                    color: 'bg-green-50 text-green-600 hover:bg-green-100',
                  },
                  {
                    label: 'Chat',
                    href: '/chat',
                    icon: 'ChatBubbleLeftRightIcon',
                    color: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
                  },
                ].map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all ${a.color}`}
                  >
                    <Icon name={a.icon as Parameters<typeof Icon>[0]['name']} size={20} />
                    {a.label}
                  </a>
                ))}
              {role === 'owner' &&
                [
                  {
                    label: 'POS System',
                    href: '/pos',
                    icon: 'ComputerDesktopIcon',
                    color: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
                  },
                  {
                    label: 'New Purchase',
                    href: '/supplier-purchases',
                    icon: 'TruckIcon',
                    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                  },
                  {
                    label: 'Inventory',
                    href: '/inventory',
                    icon: 'CubeIcon',
                    color: 'bg-green-50 text-green-600 hover:bg-green-100',
                  },
                  {
                    label: 'Chat',
                    href: '/chat',
                    icon: 'ChatBubbleLeftRightIcon',
                    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                  },
                ].map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all ${a.color}`}
                  >
                    <Icon name={a.icon as Parameters<typeof Icon>[0]['name']} size={20} />
                    {a.label}
                  </a>
                ))}
              {role === 'staff' &&
                [
                  {
                    label: 'POS System',
                    href: '/pos',
                    icon: 'ComputerDesktopIcon',
                    color: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
                  },
                  {
                    label: 'Revoke Request',
                    href: '/revoke-requests',
                    icon: 'ExclamationTriangleIcon',
                    color: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
                  },
                  {
                    label: 'Inventory',
                    href: '/inventory',
                    icon: 'CubeIcon',
                    color: 'bg-green-50 text-green-600 hover:bg-green-100',
                  },
                  {
                    label: 'Chat',
                    href: '/chat',
                    icon: 'ChatBubbleLeftRightIcon',
                    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                  },
                ].map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all ${a.color}`}
                  >
                    <Icon name={a.icon as Parameters<typeof Icon>[0]['name']} size={20} />
                    {a.label}
                  </a>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">
                {role === 'admin' ? 'Top 10 Highest Amount Orders' : 'Recent Orders'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Live from database</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 font-semibold">Live</span>
            </div>
          </div>
          {ordersLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    {[
                      '#',
                      'Order Ref',
                      'Customer',
                      'Shop',
                      'Items',
                      'Total',
                      'Status',
                      'Payment',
                      'Date',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {top10Orders.map((order, idx) => (
                    <tr key={order.id} className="hover:bg-secondary/30 transition-all">
                      <td className="px-4 py-3 text-xs font-bold text-muted-foreground">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-foreground">
                        {order.order_ref}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-secondary shrink-0">
                            {order.customer_avatar && (
                              <AppImage
                                src={order.customer_avatar}
                                alt={order.customer_avatar_alt || order.customer_name}
                                width={28}
                                height={28}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {order.customer_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {order.customer_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{order.shop_name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {Array.isArray(order.items) ? order.items.length : 0}
                      </td>
                      <td className="px-4 py-3 text-sm font-extrabold text-rose-deep">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            order.order_status === 'Delivered'
                              ? 'bg-green-50 text-green-700'
                              : order.order_status === 'Cancelled'
                                ? 'bg-red-50 text-red-600'
                                : order.order_status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            order.pay_status === 'Paid'
                              ? 'bg-green-50 text-green-700'
                              : order.pay_status === 'Refunded'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.pay_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'shops' && role === 'admin' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-bold text-foreground">All Shops</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Platform-wide shop management</p>
          </div>
          {shopsLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    {[
                      'Shop',
                      'Owner',
                      'Status',
                      'Plan',
                      'Revenue',
                      'Orders',
                      'Products',
                      'Customers',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-secondary/30 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl overflow-hidden bg-secondary shrink-0">
                            {shop.logo && (
                              <AppImage
                                src={shop.logo}
                                alt={shop.logo_alt || shop.name}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{shop.name}</p>
                            <p className="text-[10px] text-muted-foreground">{shop.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{shop.owner_name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            shop.shop_status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : shop.shop_status === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {shop.shop_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                            shop.plan === 'enterprise'
                              ? 'bg-purple-50 text-purple-700'
                              : shop.plan === 'growth'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {shop.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-rose-deep">
                        ${Number(shop.revenue).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {shop.orders_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">{shop.products_count}</td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {shop.customers_count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
