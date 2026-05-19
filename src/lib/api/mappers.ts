import type { MockUser, Order, Product, CustomerShipping } from '@/lib/mock/data';
import type {
  DbInventoryItem,
  DbNotification,
  DbOrder,
  DbShop,
} from '@/hooks/useRealtimeData';
import type { ApiOrder, ApiProduct, ApiShop, ApiUser, ApiInventoryItem, ApiNotification } from './types';
import type { CatalogProduct } from '@/lib/mock/productCatalog';

function titleCaseEnum(value: string): string {
  if (!value) return value;
  return value.charAt(0) + value.slice(1).toLowerCase();
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
  return {
    id: user.id,
    email: user.email,
    password: '',
    name: user.name,
    role: (user.role?.toLowerCase() || 'customer') as MockUser['role'],
    shopId: user.shopId ?? undefined,
    avatar: user.avatar || '',
    avatarAlt: user.avatarAlt || user.name,
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
    type: n.type as DbNotification['type'],
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
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    rating: p.rating,
    reviews: p.reviewCount,
    image: p.image,
    alt: p.imageAlt,
    badge: hasSale ? `${pct}% OFF` : tags.includes('bestseller') ? 'Best Seller' : tags.includes('new') ? 'New' : null,
    badgeType: hasSale ? 'sale' : tags.includes('bestseller') ? 'rose' : tags.includes('new') ? 'accent' : null,
    category: p.category,
    inStock: p.stock > 0 && p.status !== 'OUT_OF_STOCK',
    isNew: tags.includes('new'),
    stock: p.stock,
    shopId: p.shopId,
    shopName: p.shopName || 'Shop',
  };
}

export function mapApiProductToMock(p: ApiProduct): Product {
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
    image: p.image,
    imageAlt: p.imageAlt,
    images: (p.images || []).map((img) => ({ src: img.src, alt: img.alt })),
    description: p.description || '',
    ingredients: p.ingredients || [],
    howToUse: p.howToUse || '',
    skinType: p.skinTypes || [],
    expiryDate: p.expiryDate || '',
    sku: p.sku,
    shopId: p.shopId,
    status: (p.status?.toLowerCase().replace(/_/g, '_') || 'active') as Product['status'],
    tags: p.tags || [],
    weight: p.weight || '',
    origin: p.origin || '',
  };
}
