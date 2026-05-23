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
  /** Local demo session — skip API /users/me on reload */
  isMock?: boolean;
}

/** Response from POST /auth/register (no tokens until confirm). */
export interface RegisterPendingResponse {
  email: string;
  verificationRequired: boolean;
  message: string;
}

/** Mirrors Spring `UserResponse` (camelCase JSON). */
export interface ApiUser {
  id: string;
  email: string;
  /** Legacy UI field; prefer `fullName` from API when present */
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  /** AccountStatus from API: ACTIVE, INACTIVE, SUSPENDED, PENDING_EMAIL_VERIFICATION */
  status?: string;
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

export interface CheckoutQuote {
  subtotal: number;
  promoDiscount: number;
  autoDiscount: number;
  shipping: number;
  total: number;
  items: ApiCartItem[];
}

export interface PlaceOrderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  paymentMethod: string;
  saveInfo?: boolean;
  notes?: string;
}

export interface PlaceOrderResult {
  orders: ApiOrder[];
}

export interface ProductCreatePayload {
  name: string;
  brand?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  image?: string;
  imageAlt?: string;
  description?: string;
  sku?: string;
  status?: string;
  visible?: boolean;
  tags?: string[];
  weight?: string;
  origin?: string;
}

export interface ApiReview {
  id: string;
  productId?: string;
  userId?: string;
  userName?: string;
  rating: number;
  title: string;
  body: string;
  skinType?: string;
  createdAt?: string;
}

export interface ApiShopStaff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string;
  avatarAlt?: string;
  shopId?: string;
}

export interface ApiPosReceipt {
  id: string;
  shopId?: string;
  receiptNumber?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  subtotal?: number;
  discount?: number;
  total?: number;
  status?: string;
  createdAt?: string;
  lines?: { productId?: string; name: string; quantity: number; price: number }[];
}

export interface ApiSupplierPurchase {
  id: string;
  shopId?: string;
  supplierId?: string;
  supplierName?: string;
  status: string;
  total?: number;
  expectedDate?: string;
  createdAt?: string;
  items?: { productId?: string; productName: string; quantity: number; unitCost: number }[];
}

export interface ApiRevokeRequest {
  id: string;
  shopId?: string;
  productId?: string;
  productName?: string;
  quantity: number;
  reason: string;
  detail?: string;
  status: string;
  createdAt?: string;
}

export interface ApiShopNameChangeRequest {
  id: string;
  shopId: string;
  shopName?: string;
  ownerName?: string;
  currentName: string;
  requestedName: string;
  status: string;
  reviewNotes?: string;
  reviewedBy?: string;
  requestedBy?: string;
  createdAt?: string;
}

export interface ApiChatRoom {
  id: string;
  name?: string;
  roomType?: string;
  type?: string;
  allowedRoles?: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface ApiChatMessage {
  id: string;
  roomId?: string;
  senderId?: string;
  senderName?: string;
  content: string;
  createdAt?: string;
}

export interface ApiDirectThread {
  id: string;
  participantId?: string;
  participantName?: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface ApiDirectMessage {
  id: string;
  threadId?: string;
  senderId?: string;
  content: string;
  createdAt?: string;
  read?: boolean;
}

export interface ApiUserPreferences {
  id?: string;
  darkMode: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  lowStockAlerts: boolean;
  emailNotifications: boolean;
}

export interface ShippingAddressDto {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}
