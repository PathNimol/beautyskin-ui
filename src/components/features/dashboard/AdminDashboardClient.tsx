'use client';
import React, { useState } from 'react';
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

// ─── Mock Data (charts fallback) ────────────────────────────────────────────────

const revenueData = [
  { month: 'Jan', revenue: 4200, orders: 87 },
  { month: 'Feb', revenue: 5800, orders: 112 },
  { month: 'Mar', revenue: 4900, orders: 95 },
  { month: 'Apr', revenue: 7200, orders: 148 },
  { month: 'May', revenue: 8100, orders: 163 },
  { month: 'Jun', revenue: 6700, orders: 134 },
  { month: 'Jul', revenue: 9300, orders: 187 },
  { month: 'Aug', revenue: 8800, orders: 172 },
  { month: 'Sep', revenue: 10200, orders: 204 },
  { month: 'Oct', revenue: 9600, orders: 193 },
  { month: 'Nov', revenue: 11800, orders: 237 },
  { month: 'Dec', revenue: 13400, orders: 268 },
];

const salesTrendData = [
  { day: 'Mon', sales: 1240, returns: 45 },
  { day: 'Tue', sales: 980, returns: 32 },
  { day: 'Wed', sales: 1560, returns: 58 },
  { day: 'Thu', sales: 1120, returns: 41 },
  { day: 'Fri', sales: 1890, returns: 67 },
  { day: 'Sat', sales: 2340, returns: 89 },
  { day: 'Sun', sales: 1780, returns: 63 },
];

// Sales breakdown by category for pie chart
const categoryData = [
  { name: 'Serums', value: 35, color: '#E8B4B8' },
  { name: 'Moisturisers', value: 25, color: '#D4A373' },
  { name: 'Sunscreen', value: 18, color: '#A8C5DA' },
  { name: 'Toners', value: 13, color: '#B5D5C5' },
  { name: 'Masks', value: 9, color: '#C9B8E8' },
];

const recentOrders = [
  {
    id: '#ORD-2847',
    customer: 'Emma Rodriguez',
    product: 'Glow Essence Serum',
    amount: 28.99,
    status: 'Delivered',
    date: 'May 12, 2026',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b953edb4-1772690319677.png',
    avatarAlt: 'Young woman with warm smile',
  },
  {
    id: '#ORD-2846',
    customer: 'Mei-Lin Tanaka',
    product: 'Snail Mucin Essence',
    amount: 22.5,
    status: 'Processing',
    date: 'May 12, 2026',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_18ca1e79a-1773058034288.png',
    avatarAlt: 'Asian woman with clear skin',
  },
  {
    id: '#ORD-2845',
    customer: 'Priya Sharma',
    product: 'UV Shield SPF 50+',
    amount: 19.99,
    status: 'Shipped',
    date: 'May 11, 2026',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d570eb07-1772731577599.png',
    avatarAlt: 'South Asian woman confident',
  },
  {
    id: '#ORD-2844',
    customer: 'Sophie Williams',
    product: 'Hydra Barrier Cream',
    amount: 34.0,
    status: 'Pending',
    date: 'May 11, 2026',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e5fc8214-1763301847577.png',
    avatarAlt: 'Woman with friendly expression',
  },
  {
    id: '#ORD-2843',
    customer: 'Aiko Nakamura',
    product: 'Ceramide Repair Toner',
    amount: 42.0,
    status: 'Delivered',
    date: 'May 10, 2026',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1189b0c6b-1763296107547.png',
    avatarAlt: 'Japanese woman with professional style',
  },
  {
    id: '#ORD-2842',
    customer: 'Fatima Al-Hassan',
    product: 'Rice Water Brightener',
    amount: 31.0,
    status: 'Cancelled',
    date: 'May 10, 2026',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f73eebdf-1773114809765.png',
    avatarAlt: 'Middle Eastern woman with elegant style',
  },
];

const topProducts = [
  { name: 'Snail Mucin Essence', brand: 'COSRX', sold: 342, revenue: 7695, progress: 92 },
  { name: 'Glow Essence Serum', brand: 'COSRX', sold: 287, revenue: 8317, progress: 78 },
  { name: 'Hydra Barrier Cream', brand: 'Laneige', sold: 241, revenue: 8194, progress: 65 },
  { name: 'Centella Calming Gel', brand: 'Purito', sold: 198, revenue: 3465, progress: 53 },
  { name: 'UV Shield SPF 50+', brand: 'Skin1004', sold: 167, revenue: 3332, progress: 45 },
];

const lowStockAlerts = [
  { name: 'Eye Peptide Cream', stock: 4, threshold: 10, severity: 'critical' },
  { name: 'Honey Clay Mask', stock: 7, threshold: 15, severity: 'warning' },
  { name: 'Niacinamide 10% Serum', stock: 11, threshold: 20, severity: 'warning' },
  { name: 'Retinol Night Serum', stock: 2, threshold: 10, severity: 'critical' },
];

const expiredProducts = [
  {
    name: 'Vitamin C Brightening Serum',
    batch: 'BCH-0041',
    expiredOn: 'Apr 30, 2026',
    qty: 18,
    shop: 'Main Store',
  },
  {
    name: 'Hyaluronic Mist Spray',
    batch: 'BCH-0039',
    expiredOn: 'May 01, 2026',
    qty: 6,
    shop: 'Branch A',
  },
  {
    name: 'Collagen Eye Patch',
    batch: 'BCH-0044',
    expiredOn: 'May 05, 2026',
    qty: 24,
    shop: 'Main Store',
  },
];

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const kpis = [
  {
    label: 'Total Revenue',
    value: '$94.2K',
    change: '+8.3%',
    positive: true,
    icon: 'CurrencyDollarIcon',
    color: 'bg-primary/20 text-rose-deep',
  },
  {
    label: 'Total Orders',
    value: '2,003',
    change: '+14.1%',
    positive: true,
    icon: 'ClipboardDocumentListIcon',
    color: 'bg-accent/20 text-gold-deep',
  },
  {
    label: 'Total Products',
    value: '1,284',
    change: '-3.2%',
    positive: false,
    icon: 'ArchiveBoxIcon',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Total Customers',
    value: '3,247',
    change: '+18.7%',
    positive: true,
    icon: 'UsersIcon',
    color: 'bg-green-50 text-green-600',
  },
  {
    label: 'Total Staff',
    value: '12',
    change: '+2',
    positive: true,
    icon: 'UserGroupIcon',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    label: 'Daily Sales',
    value: '$2,847',
    change: '+12.5%',
    positive: true,
    icon: 'ChartBarIcon',
    color: 'bg-rose-50 text-rose-500',
  },
];

const statusConfig: Record<string, string> = {
  Delivered: 'badge-success',
  Processing: 'badge-info',
  Shipped: 'badge-rose',
  Pending: 'badge-warning',
  Cancelled: 'badge-danger',
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

export default function AdminDashboardClient() {
  const { data: adminData, loading: adminLoading } = useAdminDashboard();
  const apiRecentOrders = Array.isArray(adminData?.recentOrders) ? adminData.recentOrders : [];
  const apiKpis = {
    totalShops: Number(adminData?.totalShops) || 0,
    totalOrders: Number(adminData?.totalOrders) || 0,
    totalProducts: Number(adminData?.totalProducts) || 0,
    totalCustomers: Number(adminData?.totalCustomers) || 0,
    pendingOrders: Number(adminData?.pendingOrders) || 0,
  };
  const [notifOpen, setNotifOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [activeTab, setActiveTab] = useState<'orders' | 'expired'>('orders');

  const totalAlerts = lowStockAlerts.length + expiredProducts.length;

  return (
    <div className="p-6 md:p-8 min-h-screen bg-admin-bg">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="pl-10 md:pl-0">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Wednesday, May 13, 2026 · Welcome back, Admin
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
                    'revenue-report.csv',
                    ['Month', 'Revenue ($)', 'Orders'],
                    revenueData.map((d) => [d.month, d.revenue, d.orders])
                  )
                }
                onPDF={() =>
                  openPDF(
                    generatePDFContent(
                      'Revenue Report',
                      ['Month', 'Revenue ($)', 'Orders'],
                      revenueData.map((d) => [d.month, `$${d.revenue.toLocaleString()}`, d.orders])
                    )
                  )
                }
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={chartPeriod === 'monthly' ? revenueData : salesTrendData}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,43,43,0.06)" />
              <XAxis
                dataKey={chartPeriod === 'monthly' ? 'month' : 'day'}
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
                dataKey="revenue"
                stroke="#E8B4B8"
                strokeWidth={2.5}
                dot={{ fill: '#E8B4B8', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#C4848A' }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#D4A373"
                strokeWidth={2}
                dot={{ fill: '#D4A373', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#B8854A' }}
                name="Orders"
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Category Pie — 1 col */}
        <div className="chart-container">
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground">Sales by Category</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Revenue distribution this month</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Share']}
                contentStyle={{ fontSize: 12, borderRadius: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-3">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  <span className="text-xs text-muted-foreground">{cat.name}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>
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
                salesTrendData.map((d) => [d.day, d.sales, d.returns])
              )
            }
            onPDF={() =>
              openPDF(
                generatePDFContent(
                  'Sales Trends Report',
                  ['Day', 'Sales ($)', 'Returns ($)'],
                  salesTrendData.map((d) => [
                    d.day,
                    `$${d.sales.toLocaleString()}`,
                    `$${d.returns.toLocaleString()}`,
                  ])
                )
              )
            }
          />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={salesTrendData}
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
            <Bar dataKey="returns" fill="#F0E6DF" radius={[6, 6, 0, 0]} name="Returns" />
          </BarChart>
        </ResponsiveContainer>
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
                  {recentOrders.map((order) => (
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
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-border shrink-0">
                            <AppImage
                              src={order.avatar}
                              alt={order.avatarAlt}
                              width={28}
                              height={28}
                              className="object-cover w-full h-full"
                            />
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
                          className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${statusConfig[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
              {topProducts.map((product, i) => (
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
              ))}
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
