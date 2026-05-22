'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  customersApi,
  suppliersApi,
  promotionsApi,
  analyticsApi,
  dashboardApi,
} from '@/lib/api';
import type { AdminDashboardData } from '@/lib/api/types/adminDashboard';
import type { ApiPromotion, ApiSupplier, ApiUser } from '@/lib/api/types';
import { useMockAuth } from '@/contexts/MockAuthContext';

export function useCustomersList(search = '') {
  const [customers, setCustomers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await customersApi.listCustomers({ search: search || undefined, limit: 200 });
      setCustomers(page.content || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return { customers, loading, error, refetch: load };
}

export function useSuppliersList(search = '') {
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await suppliersApi.listSuppliers({ search: search || undefined, limit: 200 });
      setSuppliers(page.content || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return { suppliers, loading, error, refetch: load };
}

export function usePromotionsList(status?: string, search = '') {
  const { user } = useMockAuth();
  const shopId = user?.shopId;
  const [promotions, setPromotions] = useState<ApiPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await promotionsApi.listPromotions(shopId, {
        status,
        search: search || undefined,
        limit: 200,
      });
      setPromotions(page.content || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load promotions');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, status, search]);

  useEffect(() => {
    load();
  }, [load]);

  return { promotions, loading, error, refetch: load, shopId };
}

export function useShopDashboard() {
  const { user } = useMockAuth();
  const shopId = user?.shopId;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    dashboardApi
      .shopDashboard(shopId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  return { data, loading, shopId };
}

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    dashboardApi
      .adminDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}

export function useAnalyticsSummary(range = '30d') {
  const { user } = useMockAuth();
  /** Platform admins omit shopId so the API returns platform-wide metrics. */
  const shopId = user?.role === 'admin' ? undefined : user?.shopId;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .getSummary(shopId, range)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shopId, range]);

  return { data, loading, shopId };
}
