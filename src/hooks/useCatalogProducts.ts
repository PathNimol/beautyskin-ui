'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchCatalogProducts, type CatalogProduct } from '@/lib/mock/productCatalog';

export function useCatalogProducts(initialLimit = 48) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCatalogProducts({ limit: initialLimit });
      setProducts(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, loading, error, refetch: load };
}
