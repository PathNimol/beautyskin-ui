'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchCatalogProducts } from '@/lib/mock/productCatalog';
import { resolveShowcaseProducts } from '@/lib/catalog/showcaseStatic';
import type { CatalogProduct } from '@/lib/mock/productCatalog';

export function useShowcaseProducts() {
  const [apiProducts, setApiProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCatalogProducts({ limit: 100 });
      setApiProducts(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
      setApiProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const products = useMemo(() => resolveShowcaseProducts(apiProducts), [apiProducts]);

  const apiConnected = apiProducts.length > 0;

  return { products, loading, error, apiConnected, refetch: load };
}
