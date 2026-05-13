'use client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'owner' | 'staff' | 'buyer';

export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  shopId?: string;
  avatar: string;
  avatarAlt: string;
  phone?: string;
  joinDate: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  logo: string;
  logoAlt: string;
  description: string;
  status: 'active' | 'pending' | 'suspended';
  plan: 'starter' | 'growth' | 'enterprise';
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  createdAt: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  image: string;
  imageAlt: string;
  images: {src: string;alt: string;}[];
  description: string;
  ingredients: string[];
  howToUse: string;
  skinType: string[];
  expiryDate: string;
  sku: string;
  shopId: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  tags: string[];
  weight: string;
  origin: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar: string;
  customerAvatarAlt: string;
  shopId: string;
  shopName: string;
  items: {productId: string;name: string;qty: number;price: number;image: string;imageAlt: string;}[];
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  status: 'Pending' | 'Confirmed' | 'Packing' | 'Shipping' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  address: string;
  city: string;
  country: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  shopId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  lastRestocked: string;
  expiryDate: string;
  batchNumber: string;
  supplierId: string;
  supplierName: string;
  costPrice: number;
  status: 'healthy' | 'low' | 'critical' | 'out_of_stock' | 'expiring_soon' | 'expired';
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  category: string;
  totalOrders: number;
  totalSpent: number;
  rating: number;
  status: 'active' | 'inactive';
  joinDate: string;
  lastOrder: string;
  logo: string;
  logoAlt: string;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  shopId: string;
  description: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  customerAvatarAlt: string;
  rating: number;
  title: string;
  body: string;
  photos: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
  skinType: string;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'new_order' | 'expiry_alert' | 'review' | 'promotion' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  shopId?: string;
  link?: string;
}

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: MockUser[] = [
{
  id: 'usr-001',
  email: 'admin@beautyskin.com',
  password: 'admin123',
  name: 'Alex Morgan',
  role: 'admin',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b99e36f9-1763295192405.png",
  avatarAlt: 'Platform administrator with professional look',
  phone: '+1 555-0001',
  joinDate: 'Jan 1, 2024'
},
{
  id: 'usr-002',
  email: 'owner@beautyskin.com',
  password: 'owner123',
  name: 'Sarah Chen',
  role: 'owner',
  shopId: 'shop-001',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1024326cd-1773148666772.png",
  avatarAlt: 'Shop owner Sarah Chen with professional style',
  phone: '+1 555-0002',
  joinDate: 'Mar 15, 2024'
},
{
  id: 'usr-003',
  email: 'owner2@beautyskin.com',
  password: 'owner123',
  name: 'Ji-Yeon Park',
  role: 'owner',
  shopId: 'shop-002',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b83dec3d-1772544715826.png",
  avatarAlt: 'Korean beauty shop owner Ji-Yeon Park',
  phone: '+1 555-0003',
  joinDate: 'Apr 2, 2024'
},
{
  id: 'usr-004',
  email: 'staff@beautyskin.com',
  password: 'staff123',
  name: 'Mia Johnson',
  role: 'staff',
  shopId: 'shop-001',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_107bcec45-1773085527984.png",
  avatarAlt: 'Staff member Mia Johnson with friendly expression',
  phone: '+1 555-0004',
  joinDate: 'May 10, 2024'
},
{
  id: 'usr-005',
  email: 'buyer@beautyskin.com',
  password: 'buyer123',
  name: 'Emma Rodriguez',
  role: 'buyer',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_16b7f3773-1772140653588.png",
  avatarAlt: 'Customer Emma Rodriguez with warm smile',
  phone: '+1 555-0005',
  joinDate: 'Jun 20, 2024'
}];


// ─── Mock Shops ───────────────────────────────────────────────────────────────

export const MOCK_SHOPS: Shop[] = [
{
  id: 'shop-001',
  name: 'GlowSkin Store',
  slug: 'glowskin',
  ownerId: 'usr-002',
  ownerName: 'Sarah Chen',
  logo: "https://img.rocket.new/generatedImages/rocket_gen_img_16c200659-1778572111354.png",
  logoAlt: 'GlowSkin Store logo with rose gold aesthetic',
  description: 'Premium Korean skincare products for radiant, healthy skin.',
  status: 'active',
  plan: 'growth',
  revenue: 94200,
  orders: 1284,
  products: 87,
  customers: 3247,
  createdAt: 'Mar 15, 2024',
  category: 'Korean Skincare'
},
{
  id: 'shop-002',
  name: 'K-Beauty Hub',
  slug: 'kbeauty',
  ownerId: 'usr-003',
  ownerName: 'Ji-Yeon Park',
  logo: "https://img.rocket.new/generatedImages/rocket_gen_img_193a448a5-1778572112538.png",
  logoAlt: 'K-Beauty Hub logo with minimalist design',
  description: 'Authentic Korean beauty products directly from Seoul.',
  status: 'active',
  plan: 'enterprise',
  revenue: 127500,
  orders: 1876,
  products: 124,
  customers: 4891,
  createdAt: 'Apr 2, 2024',
  category: 'K-Beauty'
},
{
  id: 'shop-003',
  name: 'Pure Beauty Co',
  slug: 'purebeauty',
  ownerId: 'usr-006',
  ownerName: 'Amara Osei',
  logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1ce7bcf8a-1778572111634.png",
  logoAlt: 'Pure Beauty Co logo with natural aesthetic',
  description: 'Natural and organic skincare for sensitive skin types.',
  status: 'active',
  plan: 'starter',
  revenue: 42800,
  orders: 634,
  products: 45,
  customers: 1523,
  createdAt: 'May 20, 2024',
  category: 'Natural Skincare'
},
{
  id: 'shop-004',
  name: 'Natural Skin Shop',
  slug: 'naturalskin',
  ownerId: 'usr-007',
  ownerName: 'Yuki Tanaka',
  logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1eb8c3ae8-1778572111483.png",
  logoAlt: 'Natural Skin Shop logo with botanical elements',
  description: 'Japanese-inspired minimalist skincare routines.',
  status: 'pending',
  plan: 'starter',
  revenue: 0,
  orders: 0,
  products: 12,
  customers: 0,
  createdAt: 'May 10, 2026',
  category: 'Japanese Skincare'
}];


// ─── Mock Products ────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: Product[] = [
{
  id: 'prod-001',
  name: 'Snail Mucin 96% Power Repairing Essence',
  brand: 'COSRX',
  category: 'Serums',
  price: 22.50,
  originalPrice: 28.00,
  stock: 142,
  sold: 342,
  rating: 4.8,
  reviewCount: 284,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_10ac1dfcb-1772216203794.png",
  imageAlt: 'COSRX Snail Mucin Essence bottle with white minimalist packaging',
  images: [
  { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1adc2c648-1764677055508.png", alt: 'COSRX Snail Mucin Essence front view' },
  { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1e1e95dbf-1772059938786.png", alt: 'Skincare serum texture close-up' },
  { src: "https://images.unsplash.com/photo-1628751784881-c8b7b6d4dd82", alt: 'Product ingredients label detail' }],

  description: 'A lightweight essence formulated with 96% snail secretion filtrate that helps repair damaged skin and fade acne scars. Suitable for all skin types, especially sensitive and acne-prone skin.',
  ingredients: ['Snail Secretion Filtrate (96%)', 'Betaine', 'Sodium Hyaluronate', 'Allantoin', 'Panthenol', 'Arginine', 'Glycerin'],
  howToUse: 'After cleansing and toning, apply a small amount to face and gently pat until absorbed. Use morning and evening.',
  skinType: ['All', 'Sensitive', 'Acne-prone'],
  expiryDate: '2027-08-15',
  sku: 'COSRX-SNL-001',
  shopId: 'shop-001',
  status: 'active',
  tags: ['bestseller', 'repair', 'hydrating'],
  weight: '100ml',
  origin: 'South Korea'
},
{
  id: 'prod-002',
  name: 'Glow Essence Vitamin C Serum',
  brand: 'Some By Mi',
  category: 'Serums',
  price: 28.99,
  originalPrice: 35.00,
  stock: 89,
  sold: 287,
  rating: 4.6,
  reviewCount: 198,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_18bb712d0-1772325513736.png",
  imageAlt: 'Vitamin C serum in amber glass dropper bottle',
  images: [
  { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1a9c2d298-1772544717079.png", alt: 'Vitamin C serum dropper bottle front' },
  { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1e1e95dbf-1772059938786.png", alt: 'Serum texture on skin' }],

  description: 'Brightening vitamin C serum with 15% ascorbic acid that visibly reduces dark spots and evens skin tone. Formulated with ferulic acid for enhanced stability and efficacy.',
  ingredients: ['Ascorbic Acid (15%)', 'Ferulic Acid', 'Vitamin E', 'Hyaluronic Acid', 'Niacinamide', 'Glycerin'],
  howToUse: 'Apply 3-4 drops to clean skin in the morning. Follow with moisturizer and SPF.',
  skinType: ['Normal', 'Dry', 'Combination'],
  expiryDate: '2026-12-31',
  sku: 'SBM-VTC-002',
  shopId: 'shop-001',
  status: 'active',
  tags: ['brightening', 'vitamin-c', 'anti-aging'],
  weight: '30ml',
  origin: 'South Korea'
},
{
  id: 'prod-003',
  name: 'Hydra Barrier Ceramide Cream',
  brand: 'Laneige',
  category: 'Moisturizers',
  price: 34.00,
  stock: 67,
  sold: 241,
  rating: 4.7,
  reviewCount: 156,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_10f26a53e-1773000413179.png",
  imageAlt: 'Laneige moisturizer cream in elegant white jar',
  images: [
  { src: "https://images.unsplash.com/photo-1685526724067-d57ebf14903d", alt: 'Laneige cream jar open showing texture' }],

  description: 'Rich ceramide moisturizer that strengthens the skin barrier and provides 72-hour hydration. Perfect for dry and sensitive skin types.',
  ingredients: ['Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Hyaluronic Acid', 'Shea Butter', 'Niacinamide'],
  howToUse: 'Apply generously to face and neck morning and evening as the last step of your skincare routine.',
  skinType: ['Dry', 'Sensitive', 'Normal'],
  expiryDate: '2027-03-20',
  sku: 'LNG-HBC-003',
  shopId: 'shop-001',
  status: 'active',
  tags: ['moisturizer', 'ceramide', 'barrier'],
  weight: '50ml',
  origin: 'South Korea'
},
{
  id: 'prod-004',
  name: 'UV Shield Daily Sunscreen SPF 50+',
  brand: 'Skin1004',
  category: 'Sunscreen',
  price: 19.99,
  stock: 8,
  sold: 167,
  rating: 4.5,
  reviewCount: 112,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e3ccf590-1772071563633.png",
  imageAlt: 'Skin1004 sunscreen tube with clean white packaging',
  images: [
  { src: "https://images.unsplash.com/photo-1624746478154-4b6aafbe77b5", alt: 'Sunscreen tube front view' }],

  description: 'Lightweight, non-greasy sunscreen with SPF 50+ PA++++ protection. Leaves no white cast and works as a perfect makeup base.',
  ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Niacinamide', 'Centella Asiatica Extract', 'Hyaluronic Acid'],
  howToUse: 'Apply as the last step of morning skincare. Reapply every 2 hours when outdoors.',
  skinType: ['All', 'Oily', 'Combination'],
  expiryDate: '2026-07-15',
  sku: 'SK1004-UVS-004',
  shopId: 'shop-001',
  status: 'low_stock',
  tags: ['sunscreen', 'spf50', 'daily'],
  weight: '50ml',
  origin: 'South Korea'
},
{
  id: 'prod-005',
  name: 'Centella Calming Gel Cream',
  brand: 'Purito',
  category: 'Moisturizers',
  price: 17.50,
  stock: 0,
  sold: 198,
  rating: 4.4,
  reviewCount: 89,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a4555a88-1767105037110.png",
  imageAlt: 'Purito Centella gel cream in green packaging',
  images: [
  { src: "https://img.rocket.new/generatedImages/rocket_gen_img_18ed9b711-1772648183047.png", alt: 'Centella gel cream jar' }],

  description: 'Soothing gel cream with 49% centella asiatica extract that calms redness and irritation. Lightweight formula perfect for oily and combination skin.',
  ingredients: ['Centella Asiatica Extract (49%)', 'Madecassoside', 'Asiaticoside', 'Niacinamide', 'Allantoin'],
  howToUse: 'Apply a thin layer to face after toner. Can be used morning and evening.',
  skinType: ['Oily', 'Combination', 'Sensitive'],
  expiryDate: '2027-01-10',
  sku: 'PRT-CCG-005',
  shopId: 'shop-001',
  status: 'out_of_stock',
  tags: ['calming', 'centella', 'gel'],
  weight: '55ml',
  origin: 'South Korea'
},
{
  id: 'prod-006',
  name: 'Ceramide Repair Toner',
  brand: 'Dr.Jart+',
  category: 'Toners',
  price: 42.00,
  stock: 34,
  sold: 145,
  rating: 4.7,
  reviewCount: 134,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1dbf305ca-1772743304132.png",
  imageAlt: 'Dr.Jart+ Ceramide toner in sleek bottle',
  images: [
  { src: "https://images.unsplash.com/photo-1532407744821-17d4bf474f7e", alt: 'Ceramide toner bottle' }],

  description: 'Ceramide-rich toner that repairs and strengthens the skin barrier while providing deep hydration.',
  ingredients: ['Ceramide NP', 'Ceramide AP', 'Hyaluronic Acid', 'Panthenol', 'Glycerin'],
  howToUse: 'After cleansing, apply to face with cotton pad or hands and pat gently.',
  skinType: ['Dry', 'Sensitive', 'Normal'],
  expiryDate: '2026-06-30',
  sku: 'DRJ-CRT-006',
  shopId: 'shop-002',
  status: 'expiring_soon',
  tags: ['toner', 'ceramide', 'repair'],
  weight: '150ml',
  origin: 'South Korea'
},
{
  id: 'prod-007',
  name: 'Niacinamide 10% + Zinc 1% Serum',
  brand: 'The Ordinary',
  category: 'Serums',
  price: 11.90,
  stock: 11,
  sold: 412,
  rating: 4.3,
  reviewCount: 567,
  image: "https://images.unsplash.com/photo-1618384874910-9f823a21babb",
  imageAlt: 'The Ordinary Niacinamide serum in minimalist packaging',
  images: [
  { src: "https://images.unsplash.com/photo-1666025068567-31e8618c0be2", alt: 'Niacinamide serum bottle' }],

  description: 'High-strength niacinamide serum that reduces pore appearance, controls oil, and brightens skin tone.',
  ingredients: ['Niacinamide (10%)', 'Zinc PCA (1%)', 'Glycerin', 'Pentylene Glycol'],
  howToUse: 'Apply a few drops to face morning and evening before heavier creams.',
  skinType: ['Oily', 'Combination', 'Acne-prone'],
  expiryDate: '2027-05-20',
  sku: 'ORD-NIA-007',
  shopId: 'shop-002',
  status: 'low_stock',
  tags: ['niacinamide', 'pores', 'brightening'],
  weight: '30ml',
  origin: 'UK'
},
{
  id: 'prod-008',
  name: 'Honey Clay Purifying Mask',
  brand: 'Innisfree',
  category: 'Masks',
  price: 24.00,
  stock: 7,
  sold: 89,
  rating: 4.2,
  reviewCount: 67,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_14d0ee555-1771884720836.png",
  imageAlt: 'Innisfree honey clay mask in yellow packaging',
  images: [
  { src: "https://images.unsplash.com/photo-1710693547884-41a6113d67d2", alt: 'Clay mask jar' }],

  description: 'Deep cleansing clay mask with Jeju volcanic ash and honey that purifies pores while maintaining moisture balance.',
  ingredients: ['Kaolin', 'Bentonite', 'Honey Extract', 'Jeju Volcanic Ash', 'Glycerin'],
  howToUse: 'Apply evenly to face, leave for 10-15 minutes, rinse thoroughly. Use 1-2 times per week.',
  skinType: ['Oily', 'Combination'],
  expiryDate: '2026-04-15',
  sku: 'INF-HCM-008',
  shopId: 'shop-002',
  status: 'expiring_soon',
  tags: ['mask', 'clay', 'purifying'],
  weight: '100ml',
  origin: 'South Korea'
},
{
  id: 'prod-009',
  name: 'Rice Water Brightening Essence',
  brand: 'I\'m From',
  category: 'Serums',
  price: 31.00,
  stock: 56,
  sold: 178,
  rating: 4.6,
  reviewCount: 143,
  image: "https://images.unsplash.com/photo-1670201202833-b0932731628f",
  imageAlt: 'I\'m From Rice Water essence in clear bottle',
  images: [
  { src: "https://images.unsplash.com/photo-1670201202788-522ad9d46a9b", alt: 'Rice water essence bottle' }],

  description: 'Brightening essence with 77.78% rice water that improves skin texture and radiance.',
  ingredients: ['Rice Water (77.78%)', 'Niacinamide', 'Adenosine', 'Glycerin', 'Panthenol'],
  howToUse: 'After toner, apply 2-3 drops and pat gently into skin.',
  skinType: ['All', 'Dull', 'Uneven'],
  expiryDate: '2027-02-28',
  sku: 'IMF-RWB-009',
  shopId: 'shop-003',
  status: 'active',
  tags: ['brightening', 'rice', 'glow'],
  weight: '54ml',
  origin: 'South Korea'
},
{
  id: 'prod-010',
  name: 'Eye Peptide Firming Cream',
  brand: 'Neogen',
  category: 'Eye Care',
  price: 55.00,
  stock: 4,
  sold: 67,
  rating: 4.8,
  reviewCount: 45,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1be0898cd-1772727784669.png",
  imageAlt: 'Neogen eye cream in luxury packaging',
  images: [
  { src: "https://img.rocket.new/generatedImages/rocket_gen_img_12d71d196-1772221467564.png", alt: 'Eye cream jar' }],

  description: 'Peptide-rich eye cream that firms, lifts, and reduces the appearance of fine lines and dark circles.',
  ingredients: ['Peptide Complex', 'Retinol', 'Caffeine', 'Hyaluronic Acid', 'Vitamin K'],
  howToUse: 'Gently pat a small amount around the eye area morning and evening.',
  skinType: ['All', 'Mature'],
  expiryDate: '2027-09-30',
  sku: 'NEO-EPF-010',
  shopId: 'shop-003',
  status: 'low_stock',
  tags: ['eye-care', 'peptide', 'anti-aging'],
  weight: '15ml',
  origin: 'South Korea'
}];


// ─── Mock Orders ──────────────────────────────────────────────────────────────

export const MOCK_ORDERS: Order[] = [
{
  id: '#ORD-2847',
  customerId: 'usr-005',
  customerName: 'Emma Rodriguez',
  customerEmail: 'emma.r@email.com',
  customerPhone: '+1 555-0101',
  customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_16b7f3773-1772140653588.png",
  customerAvatarAlt: 'Customer Emma Rodriguez with warm smile',
  shopId: 'shop-001',
  shopName: 'GlowSkin Store',
  items: [
  { productId: 'prod-002', name: 'Glow Essence Vitamin C Serum', qty: 2, price: 28.99, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a9c2d298-1772544717079.png", imageAlt: 'Vitamin C serum' },
  { productId: 'prod-004', name: 'UV Shield Daily Sunscreen SPF 50+', qty: 1, price: 19.99, image: "https://img.rocket.new/generatedImages/rocket_gen_img_10fb86ec5-1770660043854.png", imageAlt: 'Sunscreen' }],

  total: 77.97,
  subtotal: 77.97,
  shipping: 0,
  discount: 0,
  status: 'Delivered',
  paymentMethod: 'Credit Card',
  paymentStatus: 'Paid',
  address: '123 Maple St',
  city: 'New York, NY 10001',
  country: 'USA',
  trackingNumber: 'TRK-847291',
  createdAt: 'May 12, 2026',
  updatedAt: 'May 14, 2026'
},
{
  id: '#ORD-2846',
  customerId: 'cust-002',
  customerName: 'Mei-Lin Tanaka',
  customerEmail: 'meilin@email.com',
  customerPhone: '+1 555-0102',
  customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17fb65897-1763301691509.png",
  customerAvatarAlt: 'Asian woman with clear skin',
  shopId: 'shop-002',
  shopName: 'K-Beauty Hub',
  items: [
  { productId: 'prod-001', name: 'Snail Mucin 96% Power Repairing Essence', qty: 1, price: 22.50, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d677b008-1767289040310.png", imageAlt: 'Snail mucin essence' }],

  total: 22.50,
  subtotal: 22.50,
  shipping: 0,
  discount: 0,
  status: 'Packing',
  paymentMethod: 'QR Payment',
  paymentStatus: 'Paid',
  address: '45 Cherry Blossom Ave',
  city: 'Los Angeles, CA 90001',
  country: 'USA',
  createdAt: 'May 12, 2026',
  updatedAt: 'May 12, 2026'
},
{
  id: '#ORD-2845',
  customerId: 'cust-003',
  customerName: 'Priya Sharma',
  customerEmail: 'priya.s@email.com',
  customerPhone: '+1 555-0103',
  customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14ffa8b76-1772101717598.png",
  customerAvatarAlt: 'South Asian woman confident',
  shopId: 'shop-001',
  shopName: 'GlowSkin Store',
  items: [
  { productId: 'prod-004', name: 'UV Shield Daily Sunscreen SPF 50+', qty: 2, price: 19.99, image: "https://img.rocket.new/generatedImages/rocket_gen_img_10fb86ec5-1770660043854.png", imageAlt: 'Sunscreen' },
  { productId: 'prod-006', name: 'Ceramide Repair Toner', qty: 1, price: 42.00, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1108725f1-1774340057412.png", imageAlt: 'Ceramide toner' }],

  total: 81.98,
  subtotal: 81.98,
  shipping: 0,
  discount: 0,
  status: 'Shipping',
  paymentMethod: 'Credit Card',
  paymentStatus: 'Paid',
  address: '78 Sunset Blvd',
  city: 'Miami, FL 33101',
  country: 'USA',
  trackingNumber: 'TRK-845183',
  createdAt: 'May 11, 2026',
  updatedAt: 'May 13, 2026'
},
{
  id: '#ORD-2844',
  customerId: 'cust-004',
  customerName: 'Sophie Williams',
  customerEmail: 'sophie.w@email.com',
  customerPhone: '+1 555-0104',
  customerAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e5fc8214-1763301847577.png',
  customerAvatarAlt: 'Woman with friendly expression',
  shopId: 'shop-003',
  shopName: 'Pure Beauty Co',
  items: [
  { productId: 'prod-003', name: 'Hydra Barrier Ceramide Cream', qty: 1, price: 34.00, image: "https://img.rocket.new/generatedImages/rocket_gen_img_10d8377a6-1772074025128.png", imageAlt: 'Ceramide cream' }],

  total: 34.00,
  subtotal: 34.00,
  shipping: 5.99,
  discount: 0,
  status: 'Pending',
  paymentMethod: 'Bank Transfer',
  paymentStatus: 'Pending',
  address: '12 Oak Lane',
  city: 'Chicago, IL 60601',
  country: 'USA',
  createdAt: 'May 11, 2026',
  updatedAt: 'May 11, 2026'
},
{
  id: '#ORD-2843',
  customerId: 'cust-005',
  customerName: 'Aiko Nakamura',
  customerEmail: 'aiko.n@email.com',
  customerPhone: '+1 555-0105',
  customerAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1189b0c6b-1763296107547.png',
  customerAvatarAlt: 'Japanese woman with professional style',
  shopId: 'shop-002',
  shopName: 'K-Beauty Hub',
  items: [
  { productId: 'prod-006', name: 'Ceramide Repair Toner', qty: 1, price: 42.00, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1108725f1-1774340057412.png", imageAlt: 'Ceramide toner' },
  { productId: 'prod-010', name: 'Eye Peptide Firming Cream', qty: 1, price: 55.00, image: "https://images.unsplash.com/photo-1714980716170-64cae2744604", imageAlt: 'Eye cream' }],

  total: 97.00,
  subtotal: 97.00,
  shipping: 0,
  discount: 0,
  status: 'Delivered',
  paymentMethod: 'Credit Card',
  paymentStatus: 'Paid',
  address: '99 Sakura St',
  city: 'San Francisco, CA 94101',
  country: 'USA',
  trackingNumber: 'TRK-843091',
  createdAt: 'May 10, 2026',
  updatedAt: 'May 12, 2026'
},
{
  id: '#ORD-2842',
  customerId: 'cust-006',
  customerName: 'Fatima Al-Hassan',
  customerEmail: 'fatima.ah@email.com',
  customerPhone: '+1 555-0106',
  customerAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f73eebdf-1773114809765.png',
  customerAvatarAlt: 'Middle Eastern woman with elegant style',
  shopId: 'shop-003',
  shopName: 'Pure Beauty Co',
  items: [
  { productId: 'prod-009', name: 'Rice Water Brightening Essence', qty: 1, price: 31.00, image: "https://images.unsplash.com/photo-1670201202833-b0932731628f", imageAlt: 'Rice water essence' }],

  total: 31.00,
  subtotal: 31.00,
  shipping: 5.99,
  discount: 0,
  status: 'Cancelled',
  paymentMethod: 'Credit Card',
  paymentStatus: 'Refunded',
  address: '34 Desert Rose Rd',
  city: 'Houston, TX 77001',
  country: 'USA',
  createdAt: 'May 10, 2026',
  updatedAt: 'May 11, 2026'
}];


// ─── Mock Inventory ───────────────────────────────────────────────────────────

export const MOCK_INVENTORY: InventoryItem[] = [
{ id: 'inv-001', productId: 'prod-001', productName: 'Snail Mucin 96% Power Repairing Essence', sku: 'COSRX-SNL-001', shopId: 'shop-001', currentStock: 142, minStock: 20, maxStock: 300, reorderPoint: 30, lastRestocked: 'May 1, 2026', expiryDate: '2027-08-15', batchNumber: 'BATCH-2024-08A', supplierId: 'sup-001', supplierName: 'Seoul Beauty Imports', costPrice: 12.00, status: 'healthy' },
{ id: 'inv-002', productId: 'prod-002', productName: 'Glow Essence Vitamin C Serum', sku: 'SBM-VTC-002', shopId: 'shop-001', currentStock: 89, minStock: 15, maxStock: 200, reorderPoint: 25, lastRestocked: 'Apr 20, 2026', expiryDate: '2026-12-31', batchNumber: 'BATCH-2024-12B', supplierId: 'sup-001', supplierName: 'Seoul Beauty Imports', costPrice: 15.00, status: 'healthy' },
{ id: 'inv-003', productId: 'prod-003', productName: 'Hydra Barrier Ceramide Cream', sku: 'LNG-HBC-003', shopId: 'shop-001', currentStock: 67, minStock: 10, maxStock: 150, reorderPoint: 20, lastRestocked: 'Apr 15, 2026', expiryDate: '2027-03-20', batchNumber: 'BATCH-2025-03C', supplierId: 'sup-002', supplierName: 'K-Beauty Direct', costPrice: 18.00, status: 'healthy' },
{ id: 'inv-004', productId: 'prod-004', productName: 'UV Shield Daily Sunscreen SPF 50+', sku: 'SK1004-UVS-004', shopId: 'shop-001', currentStock: 8, minStock: 15, maxStock: 200, reorderPoint: 25, lastRestocked: 'Mar 10, 2026', expiryDate: '2026-07-15', batchNumber: 'BATCH-2024-07D', supplierId: 'sup-001', supplierName: 'Seoul Beauty Imports', costPrice: 10.00, status: 'critical' },
{ id: 'inv-005', productId: 'prod-005', productName: 'Centella Calming Gel Cream', sku: 'PRT-CCG-005', shopId: 'shop-001', currentStock: 0, minStock: 10, maxStock: 150, reorderPoint: 15, lastRestocked: 'Feb 28, 2026', expiryDate: '2027-01-10', batchNumber: 'BATCH-2025-01E', supplierId: 'sup-002', supplierName: 'K-Beauty Direct', costPrice: 9.00, status: 'out_of_stock' },
{ id: 'inv-006', productId: 'prod-006', productName: 'Ceramide Repair Toner', sku: 'DRJ-CRT-006', shopId: 'shop-002', currentStock: 34, minStock: 10, maxStock: 100, reorderPoint: 15, lastRestocked: 'Apr 5, 2026', expiryDate: '2026-06-30', batchNumber: 'BATCH-2024-06F', supplierId: 'sup-003', supplierName: 'Beauty Korea Co', costPrice: 22.00, status: 'expiring_soon' },
{ id: 'inv-007', productId: 'prod-007', productName: 'Niacinamide 10% + Zinc 1% Serum', sku: 'ORD-NIA-007', shopId: 'shop-002', currentStock: 11, minStock: 20, maxStock: 250, reorderPoint: 30, lastRestocked: 'Mar 20, 2026', expiryDate: '2027-05-20', batchNumber: 'BATCH-2025-05G', supplierId: 'sup-004', supplierName: 'UK Beauty Wholesale', costPrice: 6.00, status: 'low' },
{ id: 'inv-008', productId: 'prod-008', productName: 'Honey Clay Purifying Mask', sku: 'INF-HCM-008', shopId: 'shop-002', currentStock: 7, minStock: 10, maxStock: 100, reorderPoint: 15, lastRestocked: 'Jan 15, 2026', expiryDate: '2026-04-15', batchNumber: 'BATCH-2024-04H', supplierId: 'sup-003', supplierName: 'Beauty Korea Co', costPrice: 12.00, status: 'expiring_soon' }];


// ─── Mock Suppliers ───────────────────────────────────────────────────────────

export const MOCK_SUPPLIERS: Supplier[] = [
{
  id: 'sup-001',
  name: 'Seoul Beauty Imports',
  contactPerson: 'Kim Min-jun',
  email: 'minjun@seoulbeauty.com',
  phone: '+82 2-555-0101',
  address: '123 Gangnam-daero, Gangnam-gu',
  country: 'South Korea',
  category: 'Korean Skincare',
  totalOrders: 48,
  totalSpent: 124500,
  rating: 4.8,
  status: 'active',
  joinDate: 'Jan 15, 2024',
  lastOrder: 'May 1, 2026',
  logo: "https://img.rocket.new/generatedImages/rocket_gen_img_13ef4833b-1778572112902.png",
  logoAlt: 'Seoul Beauty Imports company logo'
},
{
  id: 'sup-002',
  name: 'K-Beauty Direct',
  contactPerson: 'Park Ji-soo',
  email: 'jisoo@kbeautydirect.com',
  phone: '+82 2-555-0102',
  address: '456 Myeongdong-gil, Jung-gu',
  country: 'South Korea',
  category: 'K-Beauty',
  totalOrders: 32,
  totalSpent: 87200,
  rating: 4.6,
  status: 'active',
  joinDate: 'Feb 20, 2024',
  lastOrder: 'Apr 20, 2026',
  logo: "https://img.rocket.new/generatedImages/rocket_gen_img_13efc4bf2-1778572113159.png",
  logoAlt: 'K-Beauty Direct company logo'
},
{
  id: 'sup-003',
  name: 'Beauty Korea Co',
  contactPerson: 'Lee Soo-yeon',
  email: 'sooyeon@beautykorea.co',
  phone: '+82 2-555-0103',
  address: '789 Hongdae-ro, Mapo-gu',
  country: 'South Korea',
  category: 'Mixed Beauty',
  totalOrders: 21,
  totalSpent: 54300,
  rating: 4.3,
  status: 'active',
  joinDate: 'Mar 10, 2024',
  lastOrder: 'Apr 5, 2026',
  logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1a8247db9-1778572112428.png",
  logoAlt: 'Beauty Korea Co company logo'
},
{
  id: 'sup-004',
  name: 'UK Beauty Wholesale',
  contactPerson: 'James Harrison',
  email: 'james@ukbeauty.co.uk',
  phone: '+44 20-555-0104',
  address: '12 Oxford Street',
  country: 'United Kingdom',
  category: 'European Skincare',
  totalOrders: 15,
  totalSpent: 32100,
  rating: 4.1,
  status: 'active',
  joinDate: 'Apr 5, 2024',
  lastOrder: 'Mar 20, 2026',
  logo: "https://img.rocket.new/generatedImages/rocket_gen_img_160531d70-1778572112591.png",
  logoAlt: 'UK Beauty Wholesale company logo'
}];


// ─── Mock Promotions ──────────────────────────────────────────────────────────

export const MOCK_PROMOTIONS: Promotion[] = [
{
  id: 'promo-001',
  name: 'Summer Glow Sale',
  code: 'SUMMER20',
  type: 'percentage',
  value: 20,
  minOrder: 50,
  maxUses: 500,
  usedCount: 287,
  startDate: 'May 1, 2026',
  endDate: 'May 31, 2026',
  status: 'active',
  shopId: 'shop-001',
  description: '20% off all orders over $50 during summer sale'
},
{
  id: 'promo-002',
  name: 'New Customer Welcome',
  code: 'WELCOME15',
  type: 'percentage',
  value: 15,
  minOrder: 30,
  maxUses: 1000,
  usedCount: 412,
  startDate: 'Jan 1, 2026',
  endDate: 'Dec 31, 2026',
  status: 'active',
  shopId: 'shop-001',
  description: '15% off first order for new customers'
},
{
  id: 'promo-003',
  name: 'Free Shipping Weekend',
  code: 'FREESHIP',
  type: 'free_shipping',
  value: 0,
  minOrder: 25,
  maxUses: 200,
  usedCount: 200,
  startDate: 'May 10, 2026',
  endDate: 'May 12, 2026',
  status: 'expired',
  shopId: 'shop-002',
  description: 'Free shipping on all orders over $25'
},
{
  id: 'promo-004',
  name: 'Flash Sale - Serums',
  code: 'SERUM30',
  type: 'percentage',
  value: 30,
  minOrder: 0,
  maxUses: 100,
  usedCount: 0,
  startDate: 'May 20, 2026',
  endDate: 'May 20, 2026',
  status: 'scheduled',
  shopId: 'shop-001',
  description: '30% off all serums for 24 hours only'
},
{
  id: 'promo-005',
  name: 'Loyalty Reward',
  code: 'LOYAL10',
  type: 'fixed',
  value: 10,
  minOrder: 60,
  maxUses: 300,
  usedCount: 89,
  startDate: 'Apr 1, 2026',
  endDate: 'Jun 30, 2026',
  status: 'active',
  shopId: 'shop-002',
  description: '$10 off orders over $60 for loyal customers'
}];


// ─── Mock Reviews ─────────────────────────────────────────────────────────────

export const MOCK_REVIEWS: Review[] = [
{
  id: 'rev-001',
  productId: 'prod-001',
  customerId: 'usr-005',
  customerName: 'Emma Rodriguez',
  customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bdb060e2-1778572113176.png",
  customerAvatarAlt: 'Customer Emma Rodriguez',
  rating: 5,
  title: 'Holy grail product!',
  body: 'I\'ve been using this for 3 months and my skin has never looked better. The snail mucin really does work wonders for fading acne scars. My skin feels so smooth and hydrated.',
  photos: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200'],
  verified: true,
  helpful: 47,
  createdAt: 'Apr 28, 2026',
  skinType: 'Combination'
},
{
  id: 'rev-002',
  productId: 'prod-001',
  customerId: 'cust-002',
  customerName: 'Mei-Lin Tanaka',
  customerAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_18ca1e79a-1773058034288.png',
  customerAvatarAlt: 'Customer Mei-Lin Tanaka',
  rating: 5,
  title: 'Best essence I\'ve ever tried',
  body: 'Lightweight, absorbs quickly, and my skin looks plumper and more radiant. I\'ve repurchased this 4 times already!',
  photos: [],
  verified: true,
  helpful: 32,
  createdAt: 'Apr 15, 2026',
  skinType: 'Dry'
},
{
  id: 'rev-003',
  productId: 'prod-001',
  customerId: 'cust-003',
  customerName: 'Priya Sharma',
  customerAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d570eb07-1772731577599.png',
  customerAvatarAlt: 'Customer Priya Sharma',
  rating: 4,
  title: 'Great for sensitive skin',
  body: 'I have very reactive skin and this is one of the few products that doesn\'t cause any irritation. Gentle yet effective.',
  photos: [],
  verified: true,
  helpful: 18,
  createdAt: 'Mar 30, 2026',
  skinType: 'Sensitive'
}];


// ─── Mock Notifications ───────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
{ id: 'notif-001', type: 'low_stock', title: 'Critical Stock Alert', message: 'UV Shield SPF 50+ has only 8 units remaining', read: false, createdAt: '2 min ago', shopId: 'shop-001', link: '/inventory' },
{ id: 'notif-002', type: 'new_order', title: 'New Order Received', message: 'Order #ORD-2847 from Emma Rodriguez — $77.97', read: false, createdAt: '15 min ago', shopId: 'shop-001', link: '/orders' },
{ id: 'notif-003', type: 'expiry_alert', title: 'Product Expiring Soon', message: 'Ceramide Repair Toner expires in 48 days', read: false, createdAt: '1 hour ago', shopId: 'shop-002', link: '/inventory' },
{ id: 'notif-004', type: 'review', title: 'New Product Review', message: 'Emma Rodriguez left a 5-star review on Snail Mucin Essence', read: true, createdAt: '3 hours ago', shopId: 'shop-001', link: '/products' },
{ id: 'notif-005', type: 'low_stock', title: 'Low Stock Warning', message: 'Honey Clay Mask has only 7 units remaining', read: true, createdAt: '5 hours ago', shopId: 'shop-002', link: '/inventory' },
{ id: 'notif-006', type: 'promotion', title: 'Promotion Ending Soon', message: 'Summer Glow Sale (SUMMER20) expires in 19 days', read: true, createdAt: '1 day ago', shopId: 'shop-001', link: '/promotions' }];


// ─── Analytics Data ───────────────────────────────────────────────────────────

export const REVENUE_DATA = [
{ month: 'Jan', revenue: 4200, orders: 87, customers: 234 },
{ month: 'Feb', revenue: 5800, orders: 112, customers: 312 },
{ month: 'Mar', revenue: 4900, orders: 95, customers: 278 },
{ month: 'Apr', revenue: 7200, orders: 148, customers: 401 },
{ month: 'May', revenue: 8100, orders: 163, customers: 445 },
{ month: 'Jun', revenue: 6700, orders: 134, customers: 367 },
{ month: 'Jul', revenue: 9300, orders: 187, customers: 512 },
{ month: 'Aug', revenue: 8800, orders: 172, customers: 489 },
{ month: 'Sep', revenue: 10200, orders: 204, customers: 567 },
{ month: 'Oct', revenue: 9600, orders: 193, customers: 534 },
{ month: 'Nov', revenue: 11800, orders: 237, customers: 645 },
{ month: 'Dec', revenue: 13400, orders: 268, customers: 723 }];


export const WEEKLY_SALES_DATA = [
{ day: 'Mon', sales: 1240, returns: 45 },
{ day: 'Tue', sales: 980, returns: 32 },
{ day: 'Wed', sales: 1560, returns: 58 },
{ day: 'Thu', sales: 1120, returns: 41 },
{ day: 'Fri', sales: 1890, returns: 67 },
{ day: 'Sat', sales: 2340, returns: 89 },
{ day: 'Sun', sales: 1780, returns: 63 }];


export const PLATFORM_STATS = {
  totalShops: 4,
  activeShops: 3,
  totalRevenue: 264500,
  totalOrders: 3794,
  totalCustomers: 9661,
  totalProducts: 268,
  monthlyGrowth: 12.5,
  avgOrderValue: 69.7
};