import { productsApi, mapApiProductToCatalog } from '@/lib/api';
import type { CatalogProduct } from './productCatalog.types';

export type { CatalogProduct } from './productCatalog.types';

export async function fetchCatalogProducts(params?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<CatalogProduct[]> {
  const page = await productsApi.listCatalog({
    search: params?.search,
    category: params?.category && params.category !== 'All' ? params.category : undefined,
    minPrice: params?.minPrice != null ? String(params.minPrice) : undefined,
    maxPrice: params?.maxPrice != null && params.maxPrice !== Infinity ? String(params.maxPrice) : undefined,
    sort: mapSort(params?.sort),
    page: params?.page ?? 1,
    limit: params?.limit ?? 48,
  });
  return page.content.map(mapApiProductToCatalog);
}

export async function fetchCatalogProductById(id: string): Promise<CatalogProduct | undefined> {
  try {
    const p = await productsApi.getProduct(id);
    return mapApiProductToCatalog(p);
  } catch {
    return undefined;
  }
}

function mapSort(sort?: string): string | undefined {
  if (!sort || sort === 'Featured') return 'featured';
  if (sort === 'Price: Low to High') return 'price_asc';
  if (sort === 'Price: High to Low') return 'price_desc';
  if (sort === 'Best Rated') return 'rating';
  if (sort === 'Newest') return 'newest';
  return undefined;
}

/** @deprecated use fetchCatalogProducts — sync stub returns empty for SSR */
export function getCatalogProducts(): CatalogProduct[] {
  return [];
}

export function getCatalogProductById(_id: string) {
  return undefined;
}
