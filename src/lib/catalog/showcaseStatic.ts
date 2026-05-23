import type { CatalogProduct } from '@/lib/mock/productCatalog.types';
import { isValidProductImage } from '@/lib/api/productImage';
import { beautyProducts } from '@/lib/media/beautyImages';
import { SHOWCASE_PRODUCT_SKUS } from './showcaseSkus';

/**
 * Original home-page Best Sellers. Uses Unsplash product photography for reliable display.
 */
export const SHOWCASE_STATIC_PRODUCTS: CatalogProduct[] = [
  {
    id: 'static-UI-SHOWCASE-001',
    sku: 'UI-SHOWCASE-001',
    name: 'Glow Essence Serum',
    brand: 'COSRX',
    price: 28.99,
    originalPrice: 38.99,
    rating: 4.9,
    reviews: 1247,
    image: beautyProducts.serumVitaminC,
    alt: 'Glass vitamin C serum bottle with dropper on soft pink background',
    badge: 'Best Seller',
    badgeType: 'rose',
    category: 'Serums',
    inStock: true,
    isNew: false,
    stock: 180,
    shopId: '',
    shopName: 'GlowSkin Store',
  },
  {
    id: 'static-UI-SHOWCASE-002',
    sku: 'UI-SHOWCASE-002',
    name: 'Hydra Barrier Cream',
    brand: 'Laneige',
    price: 34.0,
    originalPrice: null,
    rating: 4.8,
    reviews: 893,
    image: beautyProducts.creamJar,
    alt: 'Rich moisturizer cream jar on marble with soft shadows',
    badge: 'New',
    badgeType: 'accent',
    category: 'Moisturizers',
    inStock: true,
    isNew: true,
    stock: 120,
    shopId: '',
    shopName: 'GlowSkin Store',
  },
  {
    id: 'static-UI-SHOWCASE-003',
    sku: 'UI-SHOWCASE-003',
    name: 'Snail Mucin Essence',
    brand: 'COSRX',
    price: 22.5,
    originalPrice: 29.0,
    rating: 4.9,
    reviews: 2103,
    image: beautyProducts.snailEssence,
    alt: 'Translucent essence bottles minimalist Korean skincare flat lay',
    badge: '22% OFF',
    badgeType: 'sale',
    category: 'Serums',
    inStock: true,
    isNew: false,
    stock: 200,
    shopId: '',
    shopName: 'K-Beauty Hub',
  },
  {
    id: 'static-UI-SHOWCASE-004',
    sku: 'UI-SHOWCASE-004',
    name: 'Gentle Foam Cleanser',
    brand: 'Innisfree',
    price: 15.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 654,
    image: beautyProducts.foamCleanser,
    alt: 'Green foam cleanser tube with botanical leaves on beige background',
    badge: null,
    badgeType: null,
    category: 'Cleansers',
    inStock: true,
    isNew: false,
    stock: 240,
    shopId: '',
    shopName: 'GlowSkin Store',
  },
  {
    id: 'static-UI-SHOWCASE-005',
    sku: 'UI-SHOWCASE-005',
    name: 'UV Shield SPF 50+',
    brand: 'Skin1004',
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.8,
    reviews: 421,
    image: beautyProducts.sunscreenTube,
    alt: 'Sunscreen tube on light cream background minimal packaging',
    badge: '20% OFF',
    badgeType: 'sale',
    category: 'Sunscreen',
    inStock: true,
    isNew: false,
    stock: 95,
    shopId: '',
    shopName: 'K-Beauty Hub',
  },
  {
    id: 'static-UI-SHOWCASE-006',
    sku: 'UI-SHOWCASE-006',
    name: 'Ceramide Repair Toner',
    brand: 'Dr. Jart+',
    price: 42.0,
    originalPrice: null,
    rating: 4.6,
    reviews: 318,
    image: beautyProducts.tonerBottle,
    alt: 'Blue toner bottle medical-inspired packaging on white',
    badge: 'Staff Pick',
    badgeType: 'info',
    category: 'Serums',
    inStock: true,
    isNew: false,
    stock: 110,
    shopId: '',
    shopName: 'GlowSkin Store',
  },
  {
    id: 'static-UI-SHOWCASE-007',
    sku: 'UI-SHOWCASE-007',
    name: 'Rice Water Brightener',
    brand: "I'm From",
    price: 31.0,
    originalPrice: 40.0,
    rating: 4.7,
    reviews: 567,
    image: beautyProducts.riceEssence,
    alt: 'Brightening essence bottle warm cream rice grain styling',
    badge: 'Trending',
    badgeType: 'rose',
    category: 'Moisturizers',
    inStock: true,
    isNew: false,
    stock: 130,
    shopId: '',
    shopName: 'K-Beauty Hub',
  },
  {
    id: 'static-UI-SHOWCASE-008',
    sku: 'UI-SHOWCASE-008',
    name: 'Centella Calming Gel',
    brand: 'Purito',
    price: 17.5,
    originalPrice: null,
    rating: 4.8,
    reviews: 789,
    image: beautyProducts.gelMoisturizer,
    alt: 'Green gel moisturizer tube centella skincare minimal white',
    badge: null,
    badgeType: null,
    category: 'Moisturizers',
    inStock: false,
    isNew: false,
    stock: 0,
    shopId: '',
    shopName: 'K-Beauty Hub',
  },
];

const STATIC_BY_SKU = Object.fromEntries(
  SHOWCASE_STATIC_PRODUCTS.map((p) => [p.sku, p])
) as Record<(typeof SHOWCASE_PRODUCT_SKUS)[number], CatalogProduct>;

/** Merge API rows onto static showcase cards (keeps imagery + order). */
export function resolveShowcaseProducts(apiProducts: CatalogProduct[]): CatalogProduct[] {
  const bySku = new Map(apiProducts.map((p) => [p.sku, p]));
  return SHOWCASE_PRODUCT_SKUS.map((sku) => {
    const fallback = STATIC_BY_SKU[sku];
    const fromApi = bySku.get(sku);
    if (!fromApi) return fallback;
    if (!fallback) return fromApi;
    const useApiImage = isValidProductImage(fromApi.image);
    return {
      ...fallback,
      ...fromApi,
      image: useApiImage ? fromApi.image : fallback.image,
      alt: useApiImage && fromApi.alt?.trim() ? fromApi.alt : fallback.alt,
      badge: fromApi.badge ?? fallback.badge,
      badgeType: fromApi.badgeType ?? fallback.badgeType,
      shopId: fromApi.shopId || fallback.shopId,
      shopName: fromApi.shopName || fallback.shopName,
    };
  }).filter((p): p is CatalogProduct => !!p);
}

export function isStaticShowcaseId(id: string): boolean {
  return id.startsWith('static-UI-SHOWCASE-');
}
