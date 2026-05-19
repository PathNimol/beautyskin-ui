export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  shopId?: string | null;
  avatar?: string;
  avatarAlt?: string;
  phone?: string;
  joinDate?: string;
  shipping?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

export interface ApiProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  image: string;
  imageAlt: string;
  images?: { src: string; alt: string }[];
  description?: string;
  ingredients?: string[];
  howToUse?: string;
  skinTypes?: string[];
  expiryDate?: string;
  sku: string;
  shopId: string;
  shopName?: string;
  status: string;
  tags?: string[];
  weight?: string;
  origin?: string;
  visible?: boolean;
}

export interface ApiOrderLine {
  productId?: string;
  name: string;
  brand?: string;
  qty: number;
  price: number;
  image?: string;
  imageAlt?: string;
}

export interface ApiOrder {
  id: string;
  orderRef: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shopId: string;
  shopName: string;
  items: ApiOrderLine[];
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zip?: string;
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiShop {
  id: string;
  name: string;
  slug: string;
  ownerId?: string | null;
  ownerName: string;
  logo?: string;
  logoAlt?: string;
  description?: string;
  status: string;
  plan: string;
  revenue: number;
  ordersCount: number;
  productsCount: number;
  customersCount: number;
  category?: string;
  createdAt: string;
}

export interface ApiInventoryItem {
  id: string;
  productId?: string;
  productName: string;
  sku: string;
  shop?: { id: string };
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  lastRestocked?: string;
  expiryDate?: string;
  batchNumber?: string;
  supplierId?: string;
  supplierName?: string;
  costPrice?: number;
  invStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiNotification {
  id: string;
  shopId?: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ApiCartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  imageAlt: string;
  shopId?: string;
  shopName?: string;
  lineTotal?: number;
}

export interface ApiCart {
  items: ApiCartItem[];
  itemCount: number;
  subtotal: number;
  appliedPromoCode?: string | null;
  discount: number;
  total: number;
}

export interface ApiSupplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  category?: string;
  totalOrders?: number;
  totalSpent?: number;
  rating?: number;
  status?: string;
  joinDate?: string;
  lastOrder?: string;
  logo?: string;
  logoAlt?: string;
}

export interface ApiPromotion {
  id: string;
  name: string;
  code: string;
  type: string;
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  status: string;
  shopId?: string;
  description?: string;
}
