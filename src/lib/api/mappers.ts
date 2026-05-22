import type { MockUser, Order, Product, CustomerShipping } from '@/lib/mock/data';
import type { DbInventoryItem, DbNotification, DbOrder, DbShop } from '@/hooks/useRealtimeData';
import type {
  ApiOrder,
  ApiProduct,
  ApiShop,
  ApiUser,
  ApiInventoryItem,
  ApiNotification,
} from './types';
import type { CatalogProduct } from '@/lib/mock/productCatalog';
import { isValidProductImage, resolveProductImageUrl } from './productImage';

function titleCaseEnum(value: string): string {
  if (!value) return value;
  return value.charAt(0) + value.slice(1).toLowerCase();
}

/** Maps Spring AccountStatus to UI customer status. */
export function mapAccountStatusFromApi(status?: string): 'active' | 'inactive' | 'suspended' {
  const s = (status || 'ACTIVE').toUpperCase();
  if (s === 'SUSPENDED') return 'suspended';
  if (s === 'INACTIVE' || s === 'PENDING_EMAIL_VERIFICATION') return 'inactive';
  return 'active';
}

export function mapAccountStatusToApi(status: 'active' | 'inactive' | 'suspended'): string {
  return status.toUpperCase();
}

export interface AdminDashboardOrderRow {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  date: string;
  avatar: string;
  avatarAlt: string;
}

export function mapApiOrderToDashboardRow(o: ApiOrder): AdminDashboardOrderRow {
  const items = o.items ?? [];
  const first = items[0];
  const product = first
    ? items.length > 1
      ? `${first.name} +${items.length - 1} more`
      : first.name
    : '—';
  const created = o.createdAt ? new Date(o.createdAt) : new Date();
  return {
    id: o.orderRef || o.id,
    customer: o.customerName || '—',
    product,
    amount: Number(o.total) || 0,
    status: titleCaseEnum(String(o.status)),
    date: created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    avatar: '',
    avatarAlt: o.customerName || 'Customer',
  };
}

function snakeStatus(value: string): DbInventoryItem['inv_status'] {
  const map: Record<string, DbInventoryItem['inv_status']> = {
    HEALTHY: 'healthy',
    LOW: 'low',
    CRITICAL: 'critical',
    OUT_OF_STOCK: 'out_of_stock',
    EXPIRING_SOON: 'expiring_soon',
    EXPIRED: 'expired',
  };
  return map[value] ?? (value.toLowerCase() as DbInventoryItem['inv_status']);
}

export function mapApiUserToMock(user: ApiUser): MockUser {
  const displayName =
    user.fullName?.trim() ||
    user.name?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.email;
  return {
    id: user.id,
    email: user.email,
    password: '',
    name: displayName,
    role: (user.role?.toLowerCase() || 'customer') as MockUser['role'],
    shopId: user.shopId ?? undefined,
    avatar: user.avatar || '',
    avatarAlt: user.avatarAlt || displayName,
    phone: user.phone,
    joinDate: user.joinDate || new Date().toISOString(),
    shipping: user.shipping as CustomerShipping | undefined,
  };
}

export function mapApiOrder(o: ApiOrder): DbOrder {
  return {
    id: o.id,
    order_ref: o.orderRef,
    customer_id: o.customerId ?? null,
    customer_name: o.customerName,
    customer_email: o.customerEmail,
    customer_phone: o.customerPhone || '',
    customer_avatar: '',
    customer_avatar_alt: o.customerName,
    shop_id: o.shopId,
    shop_name: o.shopName,
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: Number(i.price) })),
    total: Number(o.total),
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    discount: Number(o.discount),
    order_status: titleCaseEnum(o.status) as DbOrder['order_status'],
    payment_method: o.paymentMethod,
    pay_status: titleCaseEnum(o.paymentStatus) as DbOrder['pay_status'],
    address: o.address,
    city: o.city,
    country: o.country,
    tracking_number: o.trackingNumber ?? null,
    notes: o.notes ?? null,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
  };
}

export function mapApiOrderToMock(o: ApiOrder): Order {
  const db = mapApiOrder(o);
  return {
    id: db.order_ref,
    customerId: db.customer_id || '',
    customerName: db.customer_name,
    customerEmail: db.customer_email,
    customerPhone: db.customer_phone,
    customerAvatar: db.customer_avatar,
    customerAvatarAlt: db.customer_avatar_alt,
    shopId: db.shop_id,
    shopName: db.shop_name,
    items: o.items.map((i) => ({
      productId: i.productId || '',
      name: i.name,
      qty: i.qty,
      price: Number(i.price),
      image: i.image || '',
      imageAlt: i.imageAlt || i.name,
    })),
    total: db.total,
    subtotal: db.subtotal,
    shipping: db.shipping,
    discount: db.discount,
    status: db.order_status,
    paymentMethod: db.payment_method,
    paymentStatus: db.pay_status,
    address: db.address,
    city: db.city,
    country: db.country,
    trackingNumber: db.tracking_number || undefined,
    notes: db.notes || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function mapOrderStatusToApi(status: string): string {
  return status.toUpperCase();
}

export function mapApiShop(s: ApiShop): DbShop {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    owner_id: s.ownerId ?? null,
    owner_name: s.ownerName,
    logo: s.logo || '',
    logo_alt: s.logoAlt || s.name,
    description: s.description || '',
    shop_status: s.status.toLowerCase() as DbShop['shop_status'],
    plan: s.plan.toLowerCase() as DbShop['plan'],
    revenue: Number(s.revenue),
    orders_count: s.ordersCount,
    products_count: s.productsCount,
    customers_count: s.customersCount,
    category: s.category || '',
    created_at: s.createdAt,
    updated_at: s.createdAt,
  };
}

export function mapApiInventory(i: ApiInventoryItem): DbInventoryItem {
  return {
    id: i.id,
    product_id: i.productId || '',
    product_name: i.productName,
    sku: i.sku,
    shop_id: i.shop?.id || '',
    current_stock: i.currentStock,
    min_stock: i.minStock,
    max_stock: i.maxStock,
    reorder_point: i.reorderPoint,
    last_restocked: i.lastRestocked || '',
    expiry_date: i.expiryDate || '',
    batch_number: i.batchNumber || '',
    supplier_id: i.supplierId || '',
    supplier_name: i.supplierName || '',
    cost_price: Number(i.costPrice || 0),
    inv_status: snakeStatus(i.invStatus),
    created_at: i.createdAt || '',
    updated_at: i.updatedAt || '',
  };
}

export function mapApiNotification(n: ApiNotification): DbNotification {
  return {
    id: n.id,
    shop_id: n.shopId ?? null,
    type: (n.type?.toLowerCase() as DbNotification['type']) ?? 'system',
    title: n.title,
    message: n.message,
    is_read: n.read,
    metadata: {},
    created_at: n.createdAt,
  };
}

export function mapApiProductToCatalog(p: ApiProduct): CatalogProduct {
  const hasSale = p.originalPrice != null && p.originalPrice > p.price;
  const pct = hasSale ? Math.round((1 - p.price / (p.originalPrice as number)) * 100) : 0;
  const tags = p.tags || [];

  let badge: string | null = null;
  let badgeType: string | null = null;
  if (hasSale) {
    badge = `${pct}% OFF`;
    badgeType = 'sale';
  } else if (tags.includes('bestseller')) {
    badge = 'Best Seller';
    badgeType = 'rose';
  } else if (tags.includes('new')) {
    badge = 'New';
    badgeType = 'accent';
  } else if (tags.includes('trending')) {
    badge = 'Trending';
    badgeType = 'rose';
  } else if (tags.includes('staff_pick')) {
    badge = 'Staff Pick';
    badgeType = 'info';
  }

  const { image, alt } = resolveProductImageUrl(p);

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    brand: p.brand,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    rating: p.rating,
    reviews: p.reviewCount,
    image,
    alt,
    badge,
    badgeType,
    category: p.category,
    inStock: p.stock > 0 && p.status !== 'OUT_OF_STOCK',
    isNew: tags.includes('new'),
    stock: p.stock,
    shopId: p.shopId,
    shopName: p.shopName || 'Shop',
  };
}

function mapApiProductDetailStatus(p: ApiProduct): Product['status'] {
  const normalized = (p.status || 'ACTIVE').toUpperCase().replace(/-/g, '_');
  if (p.stock === 0 || normalized === 'OUT_OF_STOCK') return 'out_of_stock';
  if (normalized === 'LOW_STOCK') return 'low_stock';
  if (normalized === 'EXPIRING_SOON') return 'expiring_soon';
  if (normalized === 'EXPIRED') return 'expired';
  if (normalized === 'ACTIVE' && p.stock > 0 && p.stock <= 10) return 'low_stock';
  return 'active';
}

export function mapApiProductToMock(p: ApiProduct): Product {
  const { image, alt } = resolveProductImageUrl(p);
  const gallery = (p.images || [])
    .filter((img) => isValidProductImage(img.src))
    .map((img) => ({ src: img.src, alt: img.alt || alt }));

  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    stock: p.stock,
    sold: p.sold,
    rating: p.rating,
    reviewCount: p.reviewCount,
    image,
    imageAlt: alt,
    images: gallery.length > 0 ? gallery : image ? [{ src: image, alt }] : [],
    description: p.description || '',
    ingredients: p.ingredients || [],
    howToUse: p.howToUse || '',
    skinType: p.skinTypes || [],
    expiryDate: p.expiryDate || '',
    sku: p.sku,
    shopId: p.shopId,
    shopName: p.shopName || '',
    status: mapApiProductDetailStatus(p),
    tags: p.tags || [],
    weight: p.weight || '',
    origin: p.origin || '',
  };
}
