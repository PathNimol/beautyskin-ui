import { productsApi, mapApiProductToCatalog } from '@/lib/api';
import type { PageData } from '@/lib/api/types';
import type { CatalogProduct } from './productCatalog.types';

export type { CatalogProduct } from './productCatalog.types';

export type CatalogPageParams = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
};

export async function fetchCatalogPage(
  params?: CatalogPageParams
): Promise<PageData<CatalogProduct>> {
  const raw = await productsApi.listCatalog({
    search: params?.search,
    category: params?.category && params.category !== 'All' ? params.category : undefined,
    minPrice: params?.minPrice != null ? String(params.minPrice) : undefined,
    maxPrice: params?.maxPrice != null && params.maxPrice !== Infinity ? String(params.maxPrice) : undefined,
    sort: mapSort(params?.sort),
    page: params?.page ?? 1,
    limit: params?.limit ?? 12,
  });
  return {
    ...raw,
    content: raw.content.map(mapApiProductToCatalog),
  };
}

/** Loads first page only — prefer {@link fetchCatalogPage} for listings. */
export async function fetchCatalogProducts(params?: CatalogPageParams): Promise<CatalogProduct[]> {
  const page = await fetchCatalogPage({ ...params, limit: params?.limit ?? 80 });
  return page.content;
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
