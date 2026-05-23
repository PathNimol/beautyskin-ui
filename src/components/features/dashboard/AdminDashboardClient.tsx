'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { useAdminDashboard } from '@/hooks/useApiLists';
import { mapApiOrderToDashboardRow } from '@/lib/api/mappers';

// ─── KPI layout (values filled from GET /api/admin/dashboard) ─────────────────

const statusConfig: Record<string, string> = {
  Delivered: 'badge-success',
  Processing: 'badge-info',
  Shipped: 'badge-rose',
  Pending: 'badge-warning',
  Cancelled: 'badge-danger',
  Confirmed: 'badge-info',
  Packing: 'badge-info',
  Shipping: 'badge-rose',
  Returned: 'badge-danger',
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

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
            {p.name === 'Revenue' || p.name === 'Sales' || p.name === 'Returns'
              ? `$${p.value.toLocaleString()}`
              : p.value}
            <span className="ml-1 text-xs font-normal text-muted-foreground">{p.name}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Export Utilities ─────────────────────────────────────────────────────────

function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join(
    '\n'
  );
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function generatePDFContent(title: string, headers: string[], rows: (string | number)[][]): string {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td style="padding:8px 12px;border-bottom:1px solid #f0e6df;font-size:12px;">${cell}</td>`).join('')}</tr>`
    )
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font-family:Arial,sans-serif;margin:40px;}h1{color:#c4848a;font-size:22px;}table{width:100%;border-collapse:collapse;}th{background:#f9f0ee;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#8a7a74;border-bottom:2px solid #e8b4b8;}.footer{margin-top:32px;font-size:11px;color:#8a7a74;border-top:1px solid #f0e6df;padding-top:12px;}</style>
  </head><body><h1>${title}</h1><p style="color:#8a7a74;font-size:12px;">BS Online Shop — Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table>
  <div class="footer">© 2026 BS Online Shop — Beauty Skin. All rights reserved.</div></body></html>`;
}

function openPDF(html: string) {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}

function ExportButtons({ onPDF, onExcel }: { onPDF: () => void; onExcel: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onExcel}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition-all min-h-[32px]"
        title="Export CSV"
      >
        <Icon name="TableCellsIcon" size={13} /> Excel
      </button>
      <button
        onClick={onPDF}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-all min-h-[32px]"
        title="Export PDF"
      >
        <Icon name="DocumentArrowDownIcon" size={13} /> PDF
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function formatCount(n: number): string {
  return n.toLocaleString();
}

function formatRevenue(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

export default function AdminDashboardClient() {
  const { data: adminData, loading: adminLoading } = useAdminDashboard();

  const kpis = useMemo(
    () => [
      {
        label: 'Total Shops',
        value: adminLoading ? '—' : formatCount(adminData?.totalShops ?? 0),
        change: 'Live',
        positive: true,
        icon: 'BuildingStorefrontIcon',
        color: 'bg-blue-50 text-blue-600',
      },
      {
        label: 'Total Orders',
        value: adminLoading ? '—' : formatCount(adminData?.totalOrders ?? 0),
        change: 'Live',
        positive: true,
        icon: 'ClipboardDocumentListIcon',
        color: 'bg-accent/20 text-gold-deep',
      },
      {
        label: 'Total Products',
        value: adminLoading ? '—' : formatCount(adminData?.totalProducts ?? 0),
        change: 'Live',
        positive: true,
        icon: 'ArchiveBoxIcon',
        color: 'bg-primary/20 text-rose-deep',
      },
      {
        label: 'Total Customers',
        value: adminLoading ? '—' : formatCount(adminData?.totalCustomers ?? 0),
        change: 'Live',
        positive: true,
        icon: 'UsersIcon',
        color: 'bg-green-50 text-green-600',
      },
      {
        label: 'Revenue (30d)',
        value: adminLoading ? '—' : formatRevenue(adminData?.revenue30d ?? 0),
        change: 'Delivered',
        positive: true,
        icon: 'CurrencyDollarIcon',
        color: 'bg-rose-50 text-rose-600',
      },
      {
        label: 'Pending Orders',
        value: adminLoading ? '—' : formatCount(adminData?.pendingOrders ?? 0),
        change: (adminData?.pendingOrders ?? 0) > 0 ? 'Needs action' : 'Clear',
        positive: (adminData?.pendingOrders ?? 0) === 0,
        icon: 'ClockIcon',
        color: 'bg-amber-50 text-amber-700',
      },
    ],
    [adminLoading, adminData]
  );

  const displayRecentOrders = useMemo(
    () => (adminData?.recentOrders ?? []).map(mapApiOrderToDashboardRow),
    [adminData?.recentOrders]
  );

  const revenueChartData = useMemo(
    () =>
      (adminData?.revenueByMonth ?? []).map((r) => ({
        month: r.month,
        revenue: r.revenue,
        orders: r.orders,
      })),
    [adminData?.revenueByMonth]
  );

  const salesChartData = useMemo(
    () =>
      (adminData?.salesByDay ?? []).map((d) => ({
        day: d.day,
        sales: d.sales,
        returns: d.returns,
      })),
    [adminData?.salesByDay]
  );

  const categoryChartData = adminData?.categoryBreakdown ?? [];
  const lowStockAlerts = adminData?.lowStockAlerts ?? [];
  const expiredProducts = adminData?.expiredProducts ?? [];
  const topProducts = adminData?.topProducts ?? [];

  const [notifOpen, setNotifOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [activeTab, setActiveTab] = useState<'orders' | 'expired'>('orders');

  const totalAlerts = lowStockAlerts.length + expiredProducts.length;

  const lineChartData = chartPeriod === 'monthly' ? revenueChartData : salesChartData;
  const lineXKey = chartPeriod === 'monthly' ? 'month' : 'day';
  const linePrimaryKey = chartPeriod === 'monthly' ? 'revenue' : 'sales';
  const lineSecondaryKey = chartPeriod === 'monthly' ? 'orders' : 'returns';

  return (
    <div className="p-6 md:p-8 min-h-screen bg-admin-bg ">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="pl-10 md:pl-0">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            · Welcome back, Admin
            {adminLoading ? '' : ' · Live platform metrics'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center hover:bg-secondary transition-all shadow-soft"
              aria-label="Notifications"
            >
              <Icon name="BellIcon" size={18} className="text-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {totalAlerts}
              </span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-sm">Alerts</h3>
                  <span className="text-xs text-muted-foreground">{totalAlerts} active</span>
                </div>
                <div className="divide-y divide-border max-h-72 overflow-y-auto">
                  {lowStockAlerts.map((alert) => (
                    <div key={alert.name} className="px-5 py-3.5 hover:bg-secondary transition-all">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alert.severity === 'critical' ? 'bg-red-50' : 'bg-amber-50'}`}
                        >
                          <Icon
                            name="ExclamationTriangleIcon"
                            size={15}
                            className={
                              alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{alert.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Low stock: {alert.stock}/{alert.threshold} units
                            {alert.shopName ? ` · ${alert.shopName}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {expiredProducts.map((p) => (
                    <div key={p.batch} className="px-5 py-3.5 hover:bg-secondary transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-50">
                          <Icon name="ClockIcon" size={15} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Expired {p.expiredOn} · {p.qty} units
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-border">
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-semibold text-accent hover:text-gold-deep transition-colors"
                  >
                    Dismiss all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 px-3 py-2 bg-card border border-border rounded-xl shadow-soft">
            <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center">
              <Icon name="UserIcon" size={16} className="text-rose-deep" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-foreground leading-none">Admin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards (6 metrics) ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="admin-glass rounded-2xl p-5 shadow-card hover:shadow-rose transition-all duration-300 hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={18} />
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg ${kpi.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
              >
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Line Chart — 2 cols */}
        <div className="xl:col-span-2 chart-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground">Revenue Overview</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue & order volume</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(['weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartPeriod === p ? 'bg-primary text-foreground shadow-rose' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
              <ExportButtons
                onExcel={() =>
                  exportToCSV(
                    chartPeriod === 'monthly' ? 'revenue-report.csv' : 'sales-report.csv',
                    chartPeriod === 'monthly'
                      ? ['Month', 'Revenue ($)', 'Orders']
                      : ['Day', 'Sales ($)', 'Cancelled'],
                    lineChartData.map((d) =>
                      chartPeriod === 'monthly'
                        ? [
                            'month' in d ? d.month : '',
                            (d as { revenue: number }).revenue,
                            (d as { orders: number }).orders,
                          ]
                        : [
                            'day' in d ? d.day : '',
                            (d as { sales: number }).sales,
                            (d as { returns: number }).returns,
                          ]
                    )
                  )
                }
                onPDF={() =>
                  openPDF(
                    generatePDFContent(
                      chartPeriod === 'monthly' ? 'Revenue Report' : 'Weekly Sales',
                      chartPeriod === 'monthly'
                        ? ['Month', 'Revenue ($)', 'Orders']
                        : ['Day', 'Sales ($)', 'Cancelled'],
                      lineChartData.map((d) =>
                        chartPeriod === 'monthly'
                          ? [
                              'month' in d ? d.month : '',
                              `$${(d as { revenue: number }).revenue.toLocaleString()}`,
                              (d as { orders: number }).orders,
                            ]
                          : [
                              'day' in d ? d.day : '',
                              `$${(d as { sales: number }).sales.toLocaleString()}`,
                              (d as { returns: number }).returns,
                            ]
                      )
                    )
                  )
                }
              />
            </div>
          </div>
          {adminLoading ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
              Loading chart…
            </div>
          ) : lineChartData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
              No chart data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,43,43,0.06)" />
                <XAxis
                  dataKey={lineXKey}
                  tick={{ fontSize: 11, fill: '#8A7A74' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8A7A74' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    chartPeriod === 'monthly' ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8A7A74' }} />
                <Line
                  type="monotone"
                  dataKey={linePrimaryKey}
                  stroke="#E8B4B8"
                  strokeWidth={2.5}
                  dot={{ fill: '#E8B4B8', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#C4848A' }}
                  name={chartPeriod === 'monthly' ? 'Revenue' : 'Sales'}
                />
                <Line
                  type="monotone"
                  dataKey={lineSecondaryKey}
                  stroke="#D4A373"
                  strokeWidth={2}
                  dot={{ fill: '#D4A373', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#B8854A' }}
                  name={chartPeriod === 'monthly' ? 'Orders' : 'Cancelled'}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales Category Pie — 1 col */}
        <div className="chart-container">
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground">Sales by Category</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Revenue distribution this month</p>
          </div>
          {categoryChartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
              No category data yet.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color ?? '#E8B4B8'}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Units sold']}
                    contentStyle={{ fontSize: 12, borderRadius: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-3">
                {categoryChartData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: cat.color ?? '#E8B4B8' }}
                      />
                      <span className="text-xs text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">{cat.value} sold</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Weekly Bar Chart (full width row) ────────────────────────────────── */}
      <div className="chart-container mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-foreground">Weekly Sales Analytics</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sales vs returns this week</p>
          </div>
          <ExportButtons
            onExcel={() =>
              exportToCSV(
                'sales-trends.csv',
                ['Day', 'Sales ($)', 'Returns ($)'],
                salesChartData.map((d) => [d.day, d.sales, d.returns])
              )
            }
            onPDF={() =>
              openPDF(
                generatePDFContent(
                  'Sales Trends Report',
                  ['Day', 'Sales ($)', 'Returns ($)'],
                  salesChartData.map((d) => [
                    d.day,
                    `$${d.sales.toLocaleString()}`,
                    `$${d.returns.toLocaleString()}`,
                  ])
                )
              )
            }
          />
        </div>
        {salesChartData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
            No weekly sales data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={salesChartData}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              barSize={28}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,43,43,0.06)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#8A7A74' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8A7A74' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8A7A74' }} />
              <Bar dataKey="sales" fill="#E8B4B8" radius={[6, 6, 0, 0]} name="Sales" />
              <Bar dataKey="returns" fill="#F0E6DF" radius={[6, 6, 0, 0]} name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Bottom Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 cols: Orders / Expired tabs */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          {/* Tab header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-wrap gap-3">
            <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'orders' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Recent Orders
              </button>
              <button
                onClick={() => setActiveTab('expired')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'expired' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Expired Products
                <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {expiredProducts.length}
                </span>
              </button>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-gold-deep transition-colors"
            >
              View All <Icon name="ArrowRightIcon" size={13} />
            </Link>
          </div>

          {/* Orders table */}
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Order
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">
                      Product
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adminLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-muted-foreground"
                      >
                        Loading recent orders…
                      </td>
                    </tr>
                  ) : displayRecentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-muted-foreground"
                      >
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    displayRecentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border/50 hover:bg-secondary/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-foreground font-mono">
                            {order.id}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{order.date}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-border shrink-0 bg-secondary flex items-center justify-center">
                              {order.avatar ? (
                                <AppImage
                                  src={order.avatar}
                                  alt={order.avatarAlt}
                                  width={28}
                                  height={28}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Icon name="UserIcon" size={14} className="text-muted-foreground" />
                              )}
                            </div>
                            <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                              {order.customer}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">{order.product}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-bold text-foreground">
                            ${order.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${statusConfig[order.status] ?? 'badge-info'}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Expired products table */}
          {activeTab === 'expired' && (
            <div className="overflow-x-auto">
              <div className="flex items-center gap-3 px-6 py-3 bg-red-50 border-b border-red-100">
                <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-700 font-medium">
                  {expiredProducts.length} product batch{expiredProducts.length > 1 ? 'es' : ''}{' '}
                  have passed their expiry date and must be removed from shelves immediately.
                </p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">
                      Batch
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Expired
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Qty
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                      Shop
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expiredProducts.map((p) => (
                    <tr
                      key={p.batch}
                      className="border-b border-border/50 hover:bg-secondary/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-foreground">{p.name}</span>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-xs font-mono text-muted-foreground">{p.batch}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                          <Icon name="ClockIcon" size={12} />
                          {p.expiredOn}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs font-bold text-foreground">{p.qty}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{p.shop}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 min-h-[28px]">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right col: Top Products + Low Stock */}
        <div className="flex flex-col gap-6">
          {/* Top Products */}
          <div className="bg-card border border-border rounded-2xl shadow-card p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Top Products</h2>
                <p className="text-xs text-muted-foreground mt-0.5">by revenue</p>
              </div>
              <ExportButtons
                onExcel={() =>
                  exportToCSV(
                    'top-products.csv',
                    ['Product', 'Brand', 'Sold', 'Revenue', 'Score'],
                    topProducts.map((p) => [p.name, p.brand, p.sold, p.revenue, p.progress])
                  )
                }
                onPDF={() =>
                  openPDF(
                    generatePDFContent(
                      'Top Products',
                      ['Product', 'Brand', 'Units Sold', 'Revenue ($)', 'Score (%)'],
                      topProducts.map((p) => [
                        p.name,
                        p.brand,
                        p.sold,
                        `$${p.revenue.toLocaleString()}`,
                        `${p.progress}%`,
                      ])
                    )
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-4">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No product sales yet.
                </p>
              ) : (
                topProducts.map((product, i) => (
                  <div key={product.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{product.sold} sold</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-foreground shrink-0 ml-2">
                        ${product.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${product.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-card border border-border rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">Stock Alerts</h2>
              <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center">
                <Icon name="ExclamationTriangleIcon" size={13} className="text-red-500" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {lowStockAlerts.map((alert) => (
                <div
                  key={alert.name}
                  className={`flex items-center justify-between p-3 rounded-xl border ${alert.severity === 'critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-400'}`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{alert.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {alert.stock} / {alert.threshold} units
                      </p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-accent hover:text-gold-deep transition-colors min-h-[32px] px-2">
                    Restock
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex flex-col items-center gap-1.5 p-3 bg-secondary rounded-xl hover:bg-primary/20 transition-all group min-h-[60px]">
                  <Icon
                    name="PlusCircleIcon"
                    size={18}
                    className="text-muted-foreground group-hover:text-rose-deep transition-colors"
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    Add Product
                  </span>
                </button>
                <button
                  onClick={() =>
                    exportToCSV(
                      'top-products.csv',
                      ['Product', 'Brand', 'Sold', 'Revenue'],
                      topProducts.map((p) => [p.name, p.brand, p.sold, p.revenue])
                    )
                  }
                  className="flex flex-col items-center gap-1.5 p-3 bg-secondary rounded-xl hover:bg-accent/15 transition-all group min-h-[60px]"
                >
                  <Icon
                    name="DocumentArrowDownIcon"
                    size={18}
                    className="text-muted-foreground group-hover:text-gold-deep transition-colors"
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    Export Report
                  </span>
                </button>
                <button className="flex flex-col items-center gap-1.5 p-3 bg-secondary rounded-xl hover:bg-blue-50 transition-all group min-h-[60px]">
                  <Icon
                    name="TruckIcon"
                    size={18}
                    className="text-muted-foreground group-hover:text-blue-600 transition-colors"
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    New Order
                  </span>
                </button>
                <Link
                  href="/"
                  className="flex flex-col items-center gap-1.5 p-3 bg-secondary rounded-xl hover:bg-green-50 transition-all group min-h-[60px]"
                >
                  <Icon
                    name="ArrowTopRightOnSquareIcon"
                    size={18}
                    className="text-muted-foreground group-hover:text-green-600 transition-colors"
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    View Store
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
