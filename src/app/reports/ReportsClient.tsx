'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { REVENUE_DATA, WEEKLY_SALES_DATA, MOCK_PRODUCTS } from '@/lib/mock/data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import * as XLSX from 'xlsx';

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
type Tab = 'overview' | 'products' | 'orders' | 'inventory' | 'promotions';

// ─── Period data sets ─────────────────────────────────────────────────────────
// Each entry: { label, revenue, orders, returnRate }
const PERIOD_DATA: Record<
  Period,
  { label: string; revenue: number; orders: number; returnRate: number }[]
> = {
  daily: [
    { label: 'Mon', revenue: 1840, orders: 9, returnRate: 2.1 },
    { label: 'Tue', revenue: 2210, orders: 11, returnRate: 1.8 },
    { label: 'Wed', revenue: 1950, orders: 10, returnRate: 2.3 },
    { label: 'Thu', revenue: 2640, orders: 13, returnRate: 1.9 },
    { label: 'Fri', revenue: 3180, orders: 16, returnRate: 2.0 },
    { label: 'Sat', revenue: 4250, orders: 21, returnRate: 1.7 },
    { label: 'Sun', revenue: 3720, orders: 18, returnRate: 2.2 },
  ],
  weekly: [
    { label: 'Week 1', revenue: 18200, orders: 89, returnRate: 2.0 },
    { label: 'Week 2', revenue: 21400, orders: 104, returnRate: 1.9 },
    { label: 'Week 3', revenue: 19800, orders: 97, returnRate: 2.3 },
    { label: 'Week 4', revenue: 24600, orders: 118, returnRate: 1.8 },
  ],
  monthly: REVENUE_DATA.map((d, i) => ({
    label: d.month,
    revenue: d.revenue,
    orders: d.orders,
    returnRate: [2.1, 2.4, 1.9, 2.2, 1.8, 2.0, 2.3, 1.7, 2.1, 1.9, 2.2, 1.8][i],
  })),
  yearly: [
    { label: '2022', revenue: 380000, orders: 1820, returnRate: 3.1 },
    { label: '2023', revenue: 490000, orders: 2340, returnRate: 2.8 },
    { label: '2024', revenue: 615000, orders: 2980, returnRate: 2.4 },
    { label: '2025', revenue: 714000, orders: 3432, returnRate: 2.1 },
    { label: '2026', revenue: 284000, orders: 1380, returnRate: 2.0 },
  ],
};

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Last 7 Days',
  weekly: 'Last 4 Weeks',
  monthly: 'Last 12 Months',
  yearly: 'Year over Year',
};

const PERIOD_PREV_CHANGE: Record<
  Period,
  { revenue: string; orders: string; aov: string; profit: string }
> = {
  daily: { revenue: '+14.2%', orders: '+11.8%', aov: '+2.1%', profit: '+14.2%' },
  weekly: { revenue: '+8.6%', orders: '+7.3%', aov: '+1.2%', profit: '+8.6%' },
  monthly: { revenue: '+12.5%', orders: '+8.3%', aov: '+3.1%', profit: '+9.7%' },
  yearly: { revenue: '+31.4%', orders: '+26.4%', aov: '+3.9%', profit: '+28.1%' },
};

// ─── Static data (not period-dependent) ──────────────────────────────────────
const ORDER_STATUS_DATA = [
  { status: 'Completed', count: 1842, revenue: 124800, color: '#22C55E' },
  { status: 'Processing', count: 234, revenue: 18200, color: '#3B82F6' },
  { status: 'Shipped', count: 198, revenue: 15600, color: '#F59E0B' },
  { status: 'Pending', count: 87, revenue: 6400, color: '#F97316' },
  { status: 'Cancelled', count: 43, revenue: 2800, color: '#EF4444' },
  { status: 'Refunded', count: 28, revenue: 1900, color: '#8B5CF6' },
];

const INVENTORY_DATA = [
  {
    name: 'Niacinamide Toner',
    sku: 'SKN-004',
    qty: 0,
    reorder: 50,
    status: 'Out of Stock',
    supplier: 'ToneSupply Co',
    lead: 7,
    reorderQty: 200,
  },
  {
    name: 'Rose Hip Face Oil',
    sku: 'SKN-003',
    qty: 14,
    reorder: 30,
    status: 'Low Stock',
    supplier: 'PureOils Ltd',
    lead: 10,
    reorderQty: 100,
  },
  {
    name: 'Collagen Eye Patches',
    sku: 'ANT-006',
    qty: 22,
    reorder: 40,
    status: 'Low Stock',
    supplier: 'YouthCorp',
    lead: 5,
    reorderQty: 150,
  },
  {
    name: 'Charcoal Clay Mask',
    sku: 'SKN-007',
    qty: 31,
    reorder: 30,
    status: 'Low Stock',
    supplier: 'ClearBeauty',
    lead: 8,
    reorderQty: 100,
  },
  {
    name: 'Vitamin C Serum',
    sku: 'SKN-001',
    qty: 98,
    reorder: 50,
    status: 'Adequate',
    supplier: 'GlowLab Direct',
    lead: 7,
    reorderQty: 0,
  },
  {
    name: 'Hyaluronic Moisturizer',
    sku: 'SKN-002',
    qty: 124,
    reorder: 60,
    status: 'Adequate',
    supplier: 'HydraVeil Inc',
    lead: 10,
    reorderQty: 0,
  },
  {
    name: 'SPF 50 Sunscreen',
    sku: 'PRO-005',
    qty: 143,
    reorder: 70,
    status: 'Adequate',
    supplier: 'SunShield Corp',
    lead: 5,
    reorderQty: 0,
  },
  {
    name: 'Micellar Water',
    sku: 'CLN-010',
    qty: 211,
    reorder: 80,
    status: 'Well Stocked',
    supplier: 'AquaPure Ltd',
    lead: 3,
    reorderQty: 0,
  },
];

const PROMOTIONS_DATA = [
  {
    name: 'Summer Sale 2026',
    code: 'SUMMER20',
    type: 'Percentage',
    discount: '20%',
    uses: 342,
    maxUses: 500,
    revenue: 18400,
    discountGiven: 3680,
    status: 'active',
    expires: '2026-08-31',
  },
  {
    name: 'New User Welcome',
    code: 'WELCOME15',
    type: 'Percentage',
    discount: '15%',
    uses: 198,
    maxUses: 300,
    revenue: 9200,
    discountGiven: 1380,
    status: 'active',
    expires: '2026-12-31',
  },
  {
    name: 'Flash Friday',
    code: 'FLASH30',
    type: 'Percentage',
    discount: '30%',
    uses: 89,
    maxUses: 100,
    revenue: 6100,
    discountGiven: 1830,
    status: 'active',
    expires: '2026-05-31',
  },
  {
    name: 'Free Shipping',
    code: 'FREESHIP',
    type: 'Free Ship',
    discount: '—',
    uses: 521,
    maxUses: 999,
    revenue: 8300,
    discountGiven: 0,
    status: 'active',
    expires: '2026-06-30',
  },
  {
    name: 'VIP Members',
    code: 'VIP25',
    type: 'Percentage',
    discount: '25%',
    uses: 156,
    maxUses: 200,
    revenue: 12400,
    discountGiven: 3100,
    status: 'active',
    expires: '2026-12-31',
  },
  {
    name: 'Spring Clearance',
    code: 'SPRING10',
    type: 'Percentage',
    discount: '10%',
    uses: 500,
    maxUses: 500,
    revenue: 4200,
    discountGiven: 420,
    status: 'expired',
    expires: '2026-04-30',
  },
  {
    name: 'Birthday Special',
    code: 'BDAY50',
    type: 'Fixed',
    discount: '$50',
    uses: 43,
    maxUses: 100,
    revenue: 2100,
    discountGiven: 4200,
    status: 'scheduled',
    expires: '2026-06-01',
  },
  {
    name: 'Bundle Deal',
    code: 'BUNDLE20',
    type: 'Percentage',
    discount: '20%',
    uses: 87,
    maxUses: 150,
    revenue: 3800,
    discountGiven: 760,
    status: 'paused',
    expires: '2026-07-31',
  },
];

const CUSTOMER_METRICS = [
  {
    metric: 'Total Customers',
    value: '4,832',
    change: '+8.2%',
    target: '5,000',
    status: 'On Track',
  },
  { metric: 'New Customers', value: '312', change: '+12.4%', target: '300', status: 'Exceeding' },
  {
    metric: 'Returning Customers',
    value: '198',
    change: '+5.1%',
    target: '200',
    status: 'On Track',
  },
  { metric: 'Churn Rate', value: '3.2%', change: '-0.4%', target: '< 5%', status: 'Healthy' },
  { metric: 'Customer LTV', value: '$284', change: '+6.8%', target: '$300', status: 'On Track' },
  { metric: 'NPS Score', value: '72', change: '+4 pts', target: '75', status: 'On Track' },
];

// ─── XLSX export ──────────────────────────────────────────────────────────────
function exportXLSX(period: Period) {
  const wb = XLSX.utils.book_new();
  const data = PERIOD_DATA[period];
  const labelKey =
    period === 'yearly'
      ? 'Year'
      : period === 'monthly'
        ? 'Month'
        : period === 'weekly'
          ? 'Week'
          : 'Day';

  // Sheet 1 — Revenue
  const revenueRows = data.map((d, i) => ({
    [labelKey]: d.label,
    'Revenue ($)': d.revenue,
    'Orders (#)': d.orders,
    'Avg Order Value ($)': +(d.revenue / d.orders).toFixed(2),
    'Revenue Growth (%)':
      i === 0
        ? '—'
        : (((d.revenue - data[i - 1].revenue) / data[i - 1].revenue) * 100).toFixed(1) + '%',
    'Return Rate (%)': d.returnRate + '%',
    'Net Revenue ($)': +(d.revenue * (1 - d.returnRate / 100)).toFixed(0),
  }));
  const totRev = data.reduce((s, d) => s + d.revenue, 0);
  const totOrd = data.reduce((s, d) => s + d.orders, 0);
  revenueRows.push({
    [labelKey]: 'TOTAL / AVG',
    'Revenue ($)': totRev,
    'Orders (#)': totOrd,
    'Avg Order Value ($)': +(totRev / totOrd).toFixed(2),
    'Revenue Growth (%)': '',
    'Return Rate (%)': (data.reduce((s, d) => s + d.returnRate, 0) / data.length).toFixed(1) + '%',
    'Net Revenue ($)': data.reduce(
      (s, d) => s + Math.round(d.revenue * (1 - d.returnRate / 100)),
      0
    ),
  });
  const ws1 = XLSX.utils.json_to_sheet(revenueRows);
  ws1['!cols'] = [12, 14, 12, 18, 18, 14, 16].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws1, '📊 Revenue Overview');

  // Sheet 2 — Products
  const topProducts = [...MOCK_PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 10);
  const productRows = topProducts.map((p, i) => ({
    Rank: `#${i + 1}`,
    Product: p.name,
    Brand: p.brand,
    'Unit Price ($)': p.price,
    'Units Sold': p.sold,
    'Revenue ($)': +(p.price * p.sold).toFixed(0),
    'Est. Margin (%)': '40%',
    'Est. Profit ($)': +(p.price * p.sold * 0.4).toFixed(0),
    'Rating (★)': p.rating,
  }));
  const ws2 = XLSX.utils.json_to_sheet(productRows);
  ws2['!cols'] = [7, 28, 14, 13, 12, 14, 14, 14, 11].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws2, '🏆 Products');

  // Sheet 3 — Orders
  const totalOrdersAll = ORDER_STATUS_DATA.reduce((s, d) => s + d.count, 0);
  const orderRows = ORDER_STATUS_DATA.map((d) => ({
    Status: d.status,
    'Count (#)': d.count,
    'Revenue ($)': d.revenue,
    '% of Total': ((d.count / totalOrdersAll) * 100).toFixed(1) + '%',
    'Avg Value ($)': +(d.revenue / d.count).toFixed(2),
  }));
  const ws3 = XLSX.utils.json_to_sheet(orderRows);
  ws3['!cols'] = [16, 12, 14, 12, 14].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws3, '🛒 Orders');

  // Sheet 4 — Inventory
  const invRows = INVENTORY_DATA.map((d) => ({
    Product: d.name,
    SKU: d.sku,
    'Stock Qty': d.qty,
    'Reorder Point': d.reorder,
    Status: d.status,
    Supplier: d.supplier,
    'Lead Time (days)': d.lead,
    'Reorder Qty': d.reorderQty || '—',
    Action: d.qty === 0 ? 'Order Immediately' : d.qty <= d.reorder ? 'Reorder Soon' : 'No Action',
  }));
  const ws4 = XLSX.utils.json_to_sheet(invRows);
  ws4['!cols'] = [26, 11, 10, 14, 14, 18, 16, 12, 18].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws4, '📦 Inventory');

  // Sheet 5 — Promotions
  const promoRows = PROMOTIONS_DATA.map((d) => ({
    Name: d.name,
    Code: d.code,
    Type: d.type,
    Discount: d.discount,
    Uses: d.uses,
    'Max Uses': d.maxUses,
    'Usage %': ((d.uses / d.maxUses) * 100).toFixed(0) + '%',
    'Revenue ($)': d.revenue,
    'Discount Given ($)': d.discountGiven,
    'Net Benefit ($)': d.revenue - d.discountGiven,
    Status: d.status.charAt(0).toUpperCase() + d.status.slice(1),
    Expires: d.expires,
  }));
  const ws5 = XLSX.utils.json_to_sheet(promoRows);
  ws5['!cols'] = [22, 12, 12, 10, 8, 10, 10, 14, 18, 14, 12, 12].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws5, '🏷️ Promotions');

  const filename = `ShopReport_${period}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toLocaleString()}`);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-soft">
      <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

function KpiCard({
  label,
  value,
  change,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
  sub?: string;
}) {
  const positive = change.startsWith('+');
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-rose transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon name={icon as any} size={18} />
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-lg ${positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
        >
          {change}
        </span>
      </div>
      <p className="text-2xl font-extrabold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/60 mt-1">{sub}</p>}
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-gray-100 text-gray-500',
  scheduled: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ReportsClient() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const data = PERIOD_DATA[period];
  const changes = PERIOD_PREV_CHANGE[period];

  const totalRevenue = useMemo(() => data.reduce((s, d) => s + d.revenue, 0), [data]);
  const totalOrders = useMemo(() => data.reduce((s, d) => s + d.orders, 0), [data]);
  const avgOV = totalRevenue / totalOrders;
  const netRevenue = useMemo(
    () => data.reduce((s, d) => s + Math.round(d.revenue * (1 - d.returnRate / 100)), 0),
    [data]
  );

  const topProducts = useMemo(
    () => [...MOCK_PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 10),
    []
  );
  const totalOrdersAll = ORDER_STATUS_DATA.reduce((s, d) => s + d.count, 0);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Revenue', icon: 'ChartBarIcon' },
    { id: 'products', label: 'Products', icon: 'TagIcon' },
    { id: 'orders', label: 'Orders', icon: 'ClipboardDocumentListIcon' },
    { id: 'inventory', label: 'Inventory', icon: 'ArchiveBoxIcon' },
    { id: 'promotions', label: 'Promos', icon: 'ReceiptPercentIcon' },
  ];

  const PERIODS: { id: Period; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];

  return (
    <>
      {/* ── Top bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Shop Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{PERIOD_LABELS[period]}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p.id
                    ? 'bg-primary text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => exportXLSX(period)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all shadow-sm"
          >
            <Icon name="ArrowDownTrayIcon" size={14} />
            Export
          </button>
        </div>
      </div>

      {/* ── KPI cards — update with period ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Revenue"
          value={fmt(totalRevenue)}
          change={changes.revenue}
          icon="CurrencyDollarIcon"
          color="bg-primary/20 text-rose-deep"
          sub={PERIOD_LABELS[period]}
        />
        <KpiCard
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          change={changes.orders}
          icon="ClipboardDocumentListIcon"
          color="bg-blue-50 text-blue-600"
          sub="completed + pending"
        />
        <KpiCard
          label="Avg Order Value"
          value={`$${avgOV.toFixed(2)}`}
          change={changes.aov}
          icon="ChartBarIcon"
          color="bg-accent/20 text-amber-600"
          sub="per order"
        />
        <KpiCard
          label="Net Revenue"
          value={fmt(netRevenue)}
          change={changes.profit}
          icon="BanknotesIcon"
          color="bg-green-50 text-green-600"
          sub="after returns"
        />
      </div>

      {/* ── Tab nav ── */}
      <div className="flex gap-1 bg-secondary/60 rounded-2xl p-1 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={t.icon as any} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ════ TAB: REVENUE OVERVIEW ════ */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Revenue area chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="text-sm font-bold text-foreground mb-1">Revenue vs Net Revenue</h2>
              <p className="text-xs text-muted-foreground mb-5">{PERIOD_LABELS[period]}</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={data.map((d) => ({
                    ...d,
                    net: Math.round(d.revenue * (1 - d.returnRate / 100)),
                  }))}
                  margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                >
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8B4B8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#E8B4B8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,43,43,0.06)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#8A7A74' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#8A7A74' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E8B4B8"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="net"
                    stroke="#22C55E"
                    strokeWidth={2}
                    fill="url(#netGrad)"
                    name="Net Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Orders bar chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="text-sm font-bold text-foreground mb-1">Orders Volume</h2>
              <p className="text-xs text-muted-foreground mb-5">{PERIOD_LABELS[period]}</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={data}
                  margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                  barSize={20}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(43,43,43,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#8A7A74' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#8A7A74' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="orders" fill="#E8B4B8" radius={[6, 6, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue table */}
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">
                {period === 'daily'
                  ? 'Daily'
                  : period === 'weekly'
                    ? 'Weekly'
                    : period === 'monthly'
                      ? 'Monthly'
                      : 'Yearly'}{' '}
                Breakdown
              </h2>
              <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                {PERIOD_LABELS[period]}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    {[
                      'Period',
                      'Revenue',
                      'Orders',
                      'Avg Order',
                      'Growth',
                      'Return Rate',
                      'Net Revenue',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right first:text-left"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => {
                    const growth =
                      i === 0
                        ? null
                        : ((d.revenue - data[i - 1].revenue) / data[i - 1].revenue) * 100;
                    const net = Math.round(d.revenue * (1 - d.returnRate / 100));
                    return (
                      <tr
                        key={d.label}
                        className={`border-b border-border/40 hover:bg-secondary/20 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}
                      >
                        <td className="px-5 py-3 font-semibold text-foreground">{d.label}</td>
                        <td className="px-5 py-3 text-right font-bold text-foreground">
                          ${d.revenue.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right text-foreground">{d.orders}</td>
                        <td className="px-5 py-3 text-right text-foreground">
                          ${(d.revenue / d.orders).toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {growth === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span
                              className={
                                growth >= 0
                                  ? 'text-green-600 font-semibold'
                                  : 'text-red-500 font-semibold'
                              }
                            >
                              {growth >= 0 ? '+' : ''}
                              {growth.toFixed(1)}%
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-muted-foreground">
                          {d.returnRate}%
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-green-600">
                          ${net.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-primary/10 font-bold border-t-2 border-primary/30">
                    <td className="px-5 py-3 text-foreground text-sm">TOTAL</td>
                    <td className="px-5 py-3 text-right text-sm">
                      ${totalRevenue.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-sm">{totalOrders.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-sm">${avgOV.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-sm text-green-600">
                      {changes.revenue}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-muted-foreground">
                      {(data.reduce((s, d) => s + d.returnRate, 0) / data.length).toFixed(1)}%
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-green-600">
                      ${netRevenue.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════ TAB: PRODUCTS ════ */}
      {activeTab === 'products' && (
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Top 10 Products by Sales</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Revenue, margin & rating</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 border-b border-border">
                  {[
                    '#',
                    'Product',
                    'Brand',
                    'Price',
                    'Sold',
                    'Revenue',
                    'Est. Profit',
                    'Rating',
                    'Performance',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right first:text-center [&:nth-child(2)]:text-left [&:nth-child(3)]:text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => {
                  const rev = p.price * p.sold;
                  const profit = rev * 0.4;
                  const maxRev = topProducts[0].price * topProducts[0].sold;
                  const pct = (rev / maxRev) * 100;
                  const rankColor =
                    i === 0
                      ? 'text-amber-500'
                      : i === 1
                        ? 'text-gray-400'
                        : i === 2
                          ? 'text-orange-400'
                          : 'text-muted-foreground';
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-border/40 hover:bg-secondary/20 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-extrabold ${rankColor}`}>#{i + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground text-xs">{p.name}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.brand}</td>
                      <td className="px-4 py-3 text-right text-xs">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-xs">
                        {p.sold.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-xs">
                        ${rev.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-green-600 font-semibold">
                        ${profit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="flex items-center justify-center gap-0.5 text-xs font-bold">
                          <Icon name="StarIcon" size={10} className="text-amber-400" />
                          {p.rating}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-7 text-right">
                            {Math.round(pct)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════ TAB: ORDERS ════ */}
      {activeTab === 'orders' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="text-sm font-bold text-foreground mb-4">Orders by Status</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={ORDER_STATUS_DATA}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {ORDER_STATUS_DATA.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="text-sm font-bold text-foreground mb-4">Customer Metrics</h2>
              <div className="space-y-3">
                {CUSTOMER_METRICS.map((m) => (
                  <div
                    key={m.metric}
                    className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                  >
                    <span className="text-xs font-semibold text-foreground">{m.metric}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-foreground">{m.value}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${m.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}
                      >
                        {m.change}
                      </span>
                      <span
                        className={`text-[10px] font-bold hidden sm:inline px-2 py-0.5 rounded-lg ${m.status === 'Exceeding' ? 'bg-green-100 text-green-700' : m.status === 'Healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Order Status Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    {['Status', 'Count', 'Revenue', '% of Total', 'Avg Value', 'Action'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right first:text-left last:text-center"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ORDER_STATUS_DATA.map((d, i) => (
                    <tr
                      key={d.status}
                      className={`border-b border-border/40 hover:bg-secondary/20 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}
                    >
                      <td className="px-5 py-3">
                        <span
                          className="flex items-center gap-2 text-xs font-bold"
                          style={{ color: d.color }}
                        >
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ background: d.color }}
                          />
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-xs">
                        {d.count.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right text-xs">
                        ${d.revenue.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right text-xs">
                        {((d.count / totalOrdersAll) * 100).toFixed(1)}%
                      </td>
                      <td className="px-5 py-3 text-right text-xs">
                        ${(d.revenue / d.count).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg ${d.status === 'Completed' ? 'bg-green-50 text-green-600' : d.status === 'Cancelled' || d.status === 'Refunded' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}
                        >
                          {d.status === 'Completed'
                            ? 'None'
                            : d.status === 'Cancelled'
                              ? 'Review'
                              : d.status === 'Refunded'
                                ? 'Process'
                                : 'Follow up'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════ TAB: INVENTORY ════ */}
      {activeTab === 'inventory' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'Out of Stock',
                value: INVENTORY_DATA.filter((d) => d.status === 'Out of Stock').length,
                color: 'bg-red-50 text-red-600',
                icon: 'XCircleIcon',
              },
              {
                label: 'Low Stock',
                value: INVENTORY_DATA.filter((d) => d.status === 'Low Stock').length,
                color: 'bg-amber-50 text-amber-600',
                icon: 'ExclamationTriangleIcon',
              },
              {
                label: 'Adequate',
                value: INVENTORY_DATA.filter((d) => d.status === 'Adequate').length,
                color: 'bg-blue-50 text-blue-600',
                icon: 'CheckCircleIcon',
              },
              {
                label: 'Well Stocked',
                value: INVENTORY_DATA.filter((d) => d.status === 'Well Stocked').length,
                color: 'bg-green-50 text-green-600',
                icon: 'ArchiveBoxIcon',
              },
            ].map((k) => (
              <div
                key={k.label}
                className="bg-card border border-border rounded-2xl p-4 shadow-card"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.color}`}
                >
                  <Icon name={k.icon as any} size={16} />
                </div>
                <p className="text-2xl font-extrabold text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Inventory Status</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    {[
                      'Product',
                      'SKU',
                      'Stock',
                      'Reorder Point',
                      'Status',
                      'Supplier',
                      'Lead Time',
                      'Action',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center first:text-left"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY_DATA.map((d, i) => {
                    const urgent = d.status === 'Out of Stock';
                    const warn = d.status === 'Low Stock';
                    return (
                      <tr
                        key={d.sku}
                        className={`border-b border-border/40 hover:bg-secondary/20 transition-colors ${urgent ? 'bg-red-50/30' : warn ? 'bg-amber-50/30' : i % 2 === 0 ? '' : 'bg-secondary/10'}`}
                      >
                        <td className="px-4 py-3 font-semibold text-foreground text-xs">
                          {d.name}
                        </td>
                        <td className="px-4 py-3 text-center text-[10px] font-mono text-muted-foreground">
                          {d.sku}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs font-extrabold ${urgent ? 'text-red-600' : warn ? 'text-amber-600' : 'text-green-600'}`}
                          >
                            {d.qty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {d.reorder}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg ${urgent ? 'bg-red-100 text-red-700' : warn ? 'bg-amber-100 text-amber-700' : d.status === 'Well Stocked' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {d.supplier}
                        </td>
                        <td className="px-4 py-3 text-center text-xs">{d.lead}d</td>
                        <td className="px-4 py-3 text-center">
                          {urgent || warn ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg ${urgent ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}
                            >
                              {urgent ? 'Order Now' : 'Reorder'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════ TAB: PROMOTIONS ════ */}
      {activeTab === 'promotions' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'Active Promos',
                value: PROMOTIONS_DATA.filter((p) => p.status === 'active').length,
                icon: 'TagIcon',
                color: 'bg-green-50 text-green-600',
              },
              {
                label: 'Total Uses',
                value: PROMOTIONS_DATA.reduce((s, p) => s + p.uses, 0).toLocaleString(),
                icon: 'UsersIcon',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                label: 'Revenue via Promo',
                value: '$' + PROMOTIONS_DATA.reduce((s, p) => s + p.revenue, 0).toLocaleString(),
                icon: 'CurrencyDollarIcon',
                color: 'bg-primary/20 text-rose-deep',
              },
              {
                label: 'Discount Given',
                value:
                  '$' + PROMOTIONS_DATA.reduce((s, p) => s + p.discountGiven, 0).toLocaleString(),
                icon: 'ReceiptPercentIcon',
                color: 'bg-amber-50 text-amber-600',
              },
            ].map((k) => (
              <div
                key={k.label}
                className="bg-card border border-border rounded-2xl p-4 shadow-card"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.color}`}
                >
                  <Icon name={k.icon as any} size={16} />
                </div>
                <p className="text-xl font-extrabold text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">All Promotions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    {[
                      'Name',
                      'Code',
                      'Discount',
                      'Uses',
                      'Usage',
                      'Revenue',
                      'Discount Given',
                      'Net Benefit',
                      'Status',
                      'Expires',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right first:text-left"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PROMOTIONS_DATA.map((p, i) => (
                    <tr
                      key={p.code}
                      className={`border-b border-border/40 hover:bg-secondary/20 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}
                    >
                      <td className="px-4 py-3 font-semibold text-foreground text-xs">{p.name}</td>
                      <td className="px-4 py-3 text-right">
                        <code className="text-[11px] font-bold text-rose-deep bg-primary/10 px-2 py-0.5 rounded">
                          {p.code}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-foreground">
                        {p.discount}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        {p.uses} / {p.maxUses}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, (p.uses / p.maxUses) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {((p.uses / p.maxUses) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold">
                        ${p.revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-red-500">
                        ${p.discountGiven.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-green-600">
                        ${(p.revenue - p.discountGiven).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg capitalize ${STATUS_BADGE[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[10px] text-muted-foreground">
                        {p.expires}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-primary/10 font-bold border-t-2 border-primary/30 text-xs">
                    <td className="px-4 py-3 text-foreground" colSpan={5}>
                      TOTAL
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${PROMOTIONS_DATA.reduce((s, p) => s + p.revenue, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-red-500">
                      ${PROMOTIONS_DATA.reduce((s, p) => s + p.discountGiven, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      $
                      {PROMOTIONS_DATA.reduce(
                        (s, p) => s + p.revenue - p.discountGiven,
                        0
                      ).toLocaleString()}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
