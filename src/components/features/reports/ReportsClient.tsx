'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { REVENUE_DATA, WEEKLY_SALES_DATA } from '@/lib/mock/data';
import { useAdminDashboard, useAnalyticsSummary } from '@/hooks/useApiLists';
import type { AdminTopProductRow } from '@/lib/api/types/adminDashboard';
import { productsApi } from '@/lib/api';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-soft">
        <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
        {payload.map(p => (
          <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name.includes('revenue') || p.name.includes('sales') ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsClient() {
  const [period, setPeriod] = useState<Period>('monthly');
  const { user } = useMockAuth();
  const isAdmin = user?.role === 'admin';
  const { data: analyticsData } = useAnalyticsSummary(period === 'daily' ? '7d' : '30d');
  const { data: adminDashboard } = useAdminDashboard();
  const [ownerTopProducts, setOwnerTopProducts] = useState<AdminTopProductRow[]>([]);

  useEffect(() => {
    if (isAdmin || !user?.shopId) return;
    const loadTop = async (shopId: string) => {
      try {
        const p = await productsApi.listMerchant(shopId, { limit: 20 });
        const rows = (p.content || [])
          .map((x) => ({
            name: x.name,
            brand: x.brand || '',
            sold: Number(x.sold) || 0,
            revenue: Number(x.price) * (Number(x.sold) || 0),
            progress: 0,
          }))
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5);
        const maxSold = rows[0]?.sold || 1;
        setOwnerTopProducts(rows.map((r) => ({ ...r, progress: Math.round((r.sold / maxSold) * 100) })));
      } catch {
        setOwnerTopProducts([]);
      }
    };
    void loadTop(user.shopId);
  }, [user?.shopId, isAdmin]);

  const topProducts: AdminTopProductRow[] = isAdmin
    ? (adminDashboard?.topProducts ?? [])
    : ownerTopProducts;

  const revenueChartData =
    isAdmin && adminDashboard?.revenueByMonth?.length
      ? adminDashboard.revenueByMonth
      : REVENUE_DATA;

  const weeklyChartData =
    isAdmin && adminDashboard?.salesByDay?.length
      ? adminDashboard.salesByDay
      : WEEKLY_SALES_DATA;

  const apiRevenue = analyticsData?.revenue != null ? Number(analyticsData.revenue) : null;
  const apiOrders =
    analyticsData?.totalOrders != null ? Number(analyticsData.totalOrders) : null;
  const adminRevenue = isAdmin ? adminDashboard?.revenue30d : undefined;
  const adminOrders = isAdmin ? adminDashboard?.totalOrders : undefined;
  const mockRevenue = REVENUE_DATA.reduce((sum, d) => sum + d.revenue, 0);
  const mockOrders = REVENUE_DATA.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = adminRevenue ?? apiRevenue ?? mockRevenue;
  const totalOrders = adminOrders ?? apiOrders ?? mockOrders;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const dataSource =
    adminRevenue != null || apiRevenue != null ? 'Live (30d)' : 'Demo data';

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}K` : totalRevenue.toFixed(0)}`,
      change: dataSource,
      positive: true,
      icon: 'CurrencyDollarIcon',
      color: 'bg-primary/20 text-rose-deep',
    },
    {
      label: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: dataSource,
      positive: true,
      icon: 'ClipboardDocumentListIcon',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Avg Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      change: dataSource,
      positive: true,
      icon: 'ChartBarIcon',
      color: 'bg-accent/20 text-gold-deep',
    },
    {
      label: 'Delivered (30d)',
      value: String(analyticsData?.deliveredOrders ?? '—'),
      change: dataSource,
      positive: true,
      icon: 'ArrowUturnLeftIcon',
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <><div className="flex items-center gap-2 mb-6">
        {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${period === p ? 'bg-primary text-foreground shadow-rose' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>{p}</button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={() => exportCSV('revenue-report.csv', ['Month', 'Revenue', 'Orders'], revenueChartData.map(d => [d.month ?? d.day ?? '', 'revenue' in d ? d.revenue : d.sales, 'orders' in d ? d.orders : 0]))} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl hover:bg-green-100 transition-all">
            <Icon name="TableCellsIcon" size={14} />Export CSV
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-all">
            <Icon name="DocumentArrowDownIcon" size={14} />Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-rose transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon name={card.icon as Parameters<typeof Icon>[0]['name']} size={18} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${card.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{card.change}</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h2 className="text-base font-bold text-foreground mb-1">Revenue Trend</h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-6">Monthly revenue over the year</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8B4B8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E8B4B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,43,43,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8A7A74' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8A7A74' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#E8B4B8" strokeWidth={2.5} fill="url(#revenueGrad)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h2 className="text-base font-bold text-foreground mb-1">Weekly Sales</h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-6">Sales vs returns this week</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,43,43,0.06)" vertical={false} />
              <XAxis dataKey={weeklyChartData[0] && 'day' in weeklyChartData[0] ? 'day' : 'month'} tick={{ fontSize: 11, fill: '#8A7A74' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8A7A74' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#E8B4B8" radius={[6, 6, 0, 0]} name="sales" />
              <Bar dataKey="returns" fill="#F0E6DF" radius={[6, 6, 0, 0]} name="returns" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Top Selling Products</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Best performers by units sold</p>
          </div>
          <button onClick={() => exportCSV('top-products.csv', ['Product', 'Brand', 'Units Sold', 'Revenue'], topProducts.map(p => [p.name, p.brand, p.sold, p.revenue]))} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition-all">
            <Icon name="TableCellsIcon" size={13} />Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Rank', 'Product', 'Units Sold', 'Revenue', 'Performance'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                    No product data available
                  </td>
                </tr>
              ) : (
              topProducts.map((product, i) => {
                const revenue = product.revenue;
                const progress = product.progress || 0;
                return (
                  <tr key={`${product.name}-${i}`} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-secondary text-muted-foreground'}`}>{i + 1}</div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground">{product.brand}</p>
                    </td>
                    <td className="px-4 py-4"><span className="text-sm font-bold text-foreground">{product.sold.toLocaleString()}</span></td>
                    <td className="px-4 py-4"><span className="text-sm font-bold text-foreground">${revenue.toLocaleString()}</span></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(progress)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
