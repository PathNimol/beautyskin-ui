export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  alt: string;
  badge: string | null;
  badgeType: string | null;
  category: string;
  inStock: boolean;
  isNew: boolean;
  stock: number;
  shopId: string;
  shopName: string;
}
