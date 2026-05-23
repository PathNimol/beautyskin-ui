'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCatalogPage, type CatalogPageParams } from '@/lib/mock/productCatalog';
import type { CatalogProduct } from '@/lib/mock/productCatalog';

const DEFAULT_PAGE_SIZE = 12;

function filterKey(params: CatalogPageParams) {
  return [params.search, params.category, params.minPrice, params.maxPrice, params.sort].join('\0');
}

export function useCatalogProducts(params: CatalogPageParams) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(params.page ?? 1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const filters = useMemo(() => filterKey(params), [params.search, params.category, params.minPrice, params.maxPrice, params.sort]);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const requestPage = filters !== appliedFilters ? 1 : page;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchCatalogPage({
        ...params,
        page: requestPage,
        limit: params.limit ?? DEFAULT_PAGE_SIZE,
      });
      setProducts(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(Math.max(result.totalPages, 1));
      setError(null);
      if (filters !== appliedFilters) {
        setAppliedFilters(filters);
        setPage(1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
      setProducts([]);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.category, params.minPrice, params.maxPrice, params.sort, params.limit, requestPage, filters, appliedFilters]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    products,
    loading,
    error,
    page,
    setPage,
    totalElements,
    totalPages,
    pageSize: params.limit ?? DEFAULT_PAGE_SIZE,
    refetch: load,
  };
}
