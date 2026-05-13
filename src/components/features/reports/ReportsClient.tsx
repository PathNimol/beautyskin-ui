'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import { REVENUE_DATA, WEEKLY_SALES_DATA, MOCK_PRODUCTS } from '@/lib/mock/data';
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

  const topProducts = MOCK_PRODUCTS.sort((a, b) => b.sold - a.sold).slice(0, 5);
  const totalRevenue = REVENUE_DATA.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = REVENUE_DATA.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const summaryCards = [
    { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, change: '+12.5%', positive: true, icon: 'CurrencyDollarIcon', color: 'bg-primary/20 text-rose-deep' },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), change: '+8.3%', positive: true, icon: 'ClipboardDocumentListIcon', color: 'bg-blue-50 text-blue-600' },
    { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(2)}`, change: '+3.1%', positive: true, icon: 'ChartBarIcon', color: 'bg-accent/20 text-gold-deep' },
    { label: 'Return Rate', value: '2.4%', change: '-0.5%', positive: true, icon: 'ArrowUturnLeftIcon', color: 'bg-green-50 text-green-600' },
  ];

  return (
    <DashboardLayout title="Reports" subtitle="Analytics and business insights">
      <div className="flex items-center gap-2 mb-6">
        {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${period === p ? 'bg-primary text-foreground shadow-rose' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>{p}</button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={() => exportCSV('revenue-report.csv', ['Month', 'Revenue', 'Orders'], REVENUE_DATA.map(d => [d.month, d.revenue, d.orders]))} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl hover:bg-green-100 transition-all">
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
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
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
            <BarChart data={WEEKLY_SALES_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,43,43,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8A7A74' }} axisLine={false} tickLine={false} />
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
          <button onClick={() => exportCSV('top-products.csv', ['Product', 'Brand', 'Units Sold', 'Revenue', 'Rating'], topProducts.map(p => [p.name, p.brand, p.sold, p.price * p.sold, p.rating]))} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition-all">
            <Icon name="TableCellsIcon" size={13} />Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Rank', 'Product', 'Units Sold', 'Revenue', 'Rating', 'Performance'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, i) => {
                const revenue = product.price * product.sold;
                const maxRevenue = topProducts[0].price * topProducts[0].sold;
                const progress = (revenue / maxRevenue) * 100;
                return (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
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
                      <div className="flex items-center gap-1">
                        <Icon name="StarIcon" size={12} className="text-amber-400" />
                        <span className="text-xs font-bold text-foreground">{product.rating}</span>
                      </div>
                    </td>
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
