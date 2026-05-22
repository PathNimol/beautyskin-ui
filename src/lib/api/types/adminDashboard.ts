import type { ApiOrder } from '../types';

export interface AdminRevenueMonthRow {
  month: string;
  revenue: number;
  orders: number;
}

export interface AdminSalesDayRow {
  day: string;
  sales: number;
  returns: number;
}

export interface AdminCategoryRow {
  name: string;
  value: number;
  color?: string;
}

export interface AdminLowStockAlert {
  name: string;
  stock: number;
  threshold: number;
  severity: 'critical' | 'warning';
  shopName?: string | null;
}

export interface AdminExpiredProductRow {
  name: string;
  batch: string;
  expiredOn: string;
  qty: number;
  shop: string;
}

export interface AdminTopProductRow {
  name: string;
  brand: string;
  sold: number;
  revenue: number;
  progress: number;
}

export interface AdminDashboardData {
  totalShops: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalStaff: number;
  pendingOrders: number;
  revenue30d: number;
  recentOrders: ApiOrder[];
  revenueByMonth: AdminRevenueMonthRow[];
  salesByDay: AdminSalesDayRow[];
  categoryBreakdown: AdminCategoryRow[];
  lowStockAlerts: AdminLowStockAlert[];
  expiredProducts: AdminExpiredProductRow[];
  topProducts: AdminTopProductRow[];
}

const CATEGORY_COLORS = ['#E8B4B8', '#D4A373', '#A8C5DA', '#B5D5C5', '#C9B8E8', '#F0A6CA', '#94A3B8'];

function num(v: unknown): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapRevenueMonth(row: Record<string, unknown>): AdminRevenueMonthRow {
  return {
    month: String(row.month ?? ''),
    revenue: num(row.revenue),
    orders: num(row.orders),
  };
}

function mapSalesDay(row: Record<string, unknown>): AdminSalesDayRow {
  return {
    day: String(row.day ?? ''),
    sales: num(row.sales),
    returns: num(row.returns),
  };
}

function mapCategory(row: Record<string, unknown>, index: number): AdminCategoryRow {
  return {
    name: String(row.name ?? 'Other'),
    value: num(row.value),
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  };
}

function mapLowStock(row: Record<string, unknown>): AdminLowStockAlert {
  const sev = String(row.severity ?? 'warning').toLowerCase();
  return {
    name: String(row.name ?? ''),
    stock: num(row.stock),
    threshold: num(row.threshold),
    severity: sev === 'critical' ? 'critical' : 'warning',
    shopName: row.shopName != null ? String(row.shopName) : null,
  };
}

function mapExpired(row: Record<string, unknown>): AdminExpiredProductRow {
  return {
    name: String(row.name ?? ''),
    batch: String(row.batch ?? '—'),
    expiredOn: String(row.expiredOn ?? '—'),
    qty: num(row.qty),
    shop: String(row.shop ?? '—'),
  };
}

function mapTopProduct(row: Record<string, unknown>): AdminTopProductRow {
  return {
    name: String(row.name ?? ''),
    brand: String(row.brand ?? ''),
    sold: num(row.sold),
    revenue: num(row.revenue),
    progress: num(row.progress),
  };
}

export function parseAdminDashboard(raw: Record<string, unknown> | null): AdminDashboardData | null {
  if (!raw) return null;
  const revenueByMonth = Array.isArray(raw.revenueByMonth)
    ? (raw.revenueByMonth as Record<string, unknown>[]).map(mapRevenueMonth)
    : [];
  const salesByDay = Array.isArray(raw.salesByDay)
    ? (raw.salesByDay as Record<string, unknown>[]).map(mapSalesDay)
    : [];
  const categoryBreakdown = Array.isArray(raw.categoryBreakdown)
    ? (raw.categoryBreakdown as Record<string, unknown>[]).map(mapCategory)
    : [];
  const lowStockAlerts = Array.isArray(raw.lowStockAlerts)
    ? (raw.lowStockAlerts as Record<string, unknown>[]).map(mapLowStock)
    : [];
  const expiredProducts = Array.isArray(raw.expiredProducts)
    ? (raw.expiredProducts as Record<string, unknown>[]).map(mapExpired)
    : [];
  const topProducts = Array.isArray(raw.topProducts)
    ? (raw.topProducts as Record<string, unknown>[]).map(mapTopProduct)
    : [];
  const recentOrders = Array.isArray(raw.recentOrders) ? (raw.recentOrders as ApiOrder[]) : [];

  return {
    totalShops: num(raw.totalShops),
    totalOrders: num(raw.totalOrders),
    totalProducts: num(raw.totalProducts),
    totalCustomers: num(raw.totalCustomers),
    totalStaff: num(raw.totalStaff),
    pendingOrders: num(raw.pendingOrders),
    revenue30d: num(raw.revenue30d),
    recentOrders,
    revenueByMonth,
    salesByDay,
    categoryBreakdown,
    lowStockAlerts,
    expiredProducts,
    topProducts,
  };
}
