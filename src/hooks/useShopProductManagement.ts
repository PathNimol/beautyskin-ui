'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type DbProductStatus =
  | 'active'
  | 'low_stock'
  | 'out_of_stock'
  | 'expiring_soon'
  | 'expired';

export interface DbProductRow {
  id: string;
  shop_id: string | null;
  name: string;
  brand: string;
  category: string;
  price: number;
  original_price: number | null;
  stock: number;
  sold: number;
  rating: number;
  review_count: number;
  image: string;
  image_alt: string;
  description: string;
  ingredients: string[];
  how_to_use: string;
  skin_type: string[];
  expiry_date: string;
  sku: string;
  product_status: DbProductStatus;
  tags: string[];
  weight: string;
  origin: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_revoked: boolean;
  gallery: string[];
}

export interface DbShopCategory {
  id: string;
  shop_id: string;
  name: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbShopBrand {
  id: string;
  shop_id: string;
  name: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProductStockEvent {
  id: string;
  product_id: string;
  shop_id: string;
  quantity_received: number;
  supplier_name: string;
  note: string;
  recorded_by_role: string;
  created_at: string;
}

function parseNum(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') return Number(v) || fallback;
  return fallback;
}

/** Derive catalog status from stock and expiry (ignores revoke / soft-delete flags). */
export function computeProductStatus(stock: number, expiryDate: string): DbProductStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock < 10) return 'low_stock';
  const d = new Date(expiryDate);
  if (!Number.isNaN(d.getTime())) {
    const days = (d.getTime() - Date.now()) / 86400000;
    if (days < 0) return 'expired';
    if (days < 90) return 'expiring_soon';
  }
  return 'active';
}

function normalizeProductRow(row: Record<string, unknown>): DbProductRow {
  const ingredients = Array.isArray(row.ingredients) ? (row.ingredients as string[]) : [];
  const skin_type = Array.isArray(row.skin_type) ? (row.skin_type as string[]) : [];
  const tags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
  const gallery = Array.isArray(row.gallery) ? (row.gallery as string[]) : [];
  return {
    id: String(row.id),
    shop_id: row.shop_id == null ? null : String(row.shop_id),
    name: String(row.name ?? ''),
    brand: String(row.brand ?? ''),
    category: String(row.category ?? ''),
    price: parseNum(row.price),
    original_price: row.original_price == null ? null : parseNum(row.original_price),
    stock: parseNum(row.stock),
    sold: parseNum(row.sold),
    rating: parseNum(row.rating),
    review_count: parseNum(row.review_count),
    image: String(row.image ?? ''),
    image_alt: String(row.image_alt ?? ''),
    description: String(row.description ?? ''),
    ingredients,
    how_to_use: String(row.how_to_use ?? ''),
    skin_type,
    expiry_date: String(row.expiry_date ?? ''),
    sku: String(row.sku ?? ''),
    product_status: (row.product_status as DbProductStatus) || 'active',
    tags,
    weight: String(row.weight ?? ''),
    origin: String(row.origin ?? ''),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    is_deleted: Boolean(row.is_deleted),
    is_revoked: Boolean(row.is_revoked),
    gallery,
  };
}

async function syncInventoryStock(
  supabase: ReturnType<typeof createClient>,
  product: Pick<DbProductRow, 'id' | 'shop_id' | 'stock' | 'sku' | 'name' | 'expiry_date'>
) {
  if (!product.shop_id) return;
  const { data } = await supabase
    .from('inventory_items')
    .select('id, min_stock, reorder_point')
    .eq('product_id', product.id)
    .maybeSingle();

  if (!data?.id) return;

  const stock = product.stock;
  const min_stock = parseNum((data as { min_stock?: number }).min_stock, 0);
  const reorder_point = parseNum((data as { reorder_point?: number }).reorder_point, 10);

  let inv_status: 'healthy' | 'low' | 'critical' | 'out_of_stock' | 'expiring_soon' | 'expired' = 'healthy';
  if (stock === 0) inv_status = 'out_of_stock';
  else if (stock < min_stock) inv_status = 'critical';
  else if (stock < reorder_point) inv_status = 'low';

  const exp = new Date(product.expiry_date);
  if (!Number.isNaN(exp.getTime())) {
    const days = (exp.getTime() - Date.now()) / 86400000;
    if (days < 0) inv_status = 'expired';
    else if (days < 90 && inv_status === 'healthy') inv_status = 'expiring_soon';
  }

  await supabase
    .from('inventory_items')
    .update({
      current_stock: stock,
      inv_status,
      expiry_date: product.expiry_date,
      last_restocked: new Date().toISOString(),
    })
    .eq('id', data.id);
}

export function useShopProductManagement(shopId: string | undefined) {
  const [products, setProducts] = useState<DbProductRow[]>([]);
  const [categories, setCategories] = useState<DbShopCategory[]>([]);
  const [brands, setBrands] = useState<DbShopBrand[]>([]);
  const [stockEvents, setStockEvents] = useState<DbProductStockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!shopId) return;
    const supabase = createClient();
    const { data, error: e } = await supabase
      .from('shop_categories')
      .select('*')
      .eq('shop_id', shopId)
      .order('name', { ascending: true });
    if (e) return;
    setCategories((data as DbShopCategory[]) || []);
  }, [shopId]);

  const fetchBrands = useCallback(async () => {
    if (!shopId) return;
    const supabase = createClient();
    const { data, error: e } = await supabase.from('shop_brands').select('*').eq('shop_id', shopId).order('name', { ascending: true });
    if (e) return;
    setBrands((data as DbShopBrand[]) || []);
  }, [shopId]);

  const fetchProducts = useCallback(async () => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('name', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setProducts([]);
        return;
      }
      setProducts(((data as Record<string, unknown>[]) || []).map(normalizeProductRow));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const fetchStockEvents = useCallback(async () => {
    if (!shopId) return;
    const supabase = createClient();
    const { data, error: e } = await supabase
      .from('product_stock_events')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (!e && data) setStockEvents(data as DbProductStockEvent[]);
  }, [shopId]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
    fetchStockEvents();
  }, [fetchProducts, fetchCategories, fetchBrands, fetchStockEvents]);

  const insertCategory = useCallback(
    async (name: string) => {
      if (!shopId || !name.trim()) return { ok: false as const, message: 'Name required' };
      const supabase = createClient();
      const { error: e } = await supabase.from('shop_categories').insert({ shop_id: shopId, name: name.trim() });
      if (e) return { ok: false as const, message: e.message };
      await fetchCategories();
      return { ok: true as const };
    },
    [shopId, fetchCategories]
  );

  const softDeleteCategory = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error: e } = await supabase.from('shop_categories').update({ is_deleted: true }).eq('id', id);
      if (e) return false;
      await fetchCategories();
      return true;
    },
    [fetchCategories]
  );

  const insertBrand = useCallback(
    async (name: string) => {
      if (!shopId || !name.trim()) return { ok: false as const, message: 'Name required' };
      const supabase = createClient();
      const { error: e } = await supabase.from('shop_brands').insert({ shop_id: shopId, name: name.trim() });
      if (e) return { ok: false as const, message: e.message };
      await fetchBrands();
      return { ok: true as const };
    },
    [shopId, fetchBrands]
  );

  const softDeleteBrand = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error: e } = await supabase.from('shop_brands').update({ is_deleted: true }).eq('id', id);
      if (e) return false;
      await fetchBrands();
      return true;
    },
    [fetchBrands]
  );

  const insertProduct = useCallback(
    async (payload: Partial<DbProductRow> & { name: string; shop_id: string }) => {
      const supabase = createClient();
      const status = computeProductStatus(payload.stock ?? 0, payload.expiry_date ?? '');
      const row = {
        shop_id: payload.shop_id,
        name: payload.name,
        brand: payload.brand ?? '',
        category: payload.category ?? '',
        price: payload.price ?? 0,
        original_price: payload.original_price ?? null,
        stock: payload.stock ?? 0,
        sold: payload.sold ?? 0,
        rating: payload.rating ?? 0,
        review_count: payload.review_count ?? 0,
        image: payload.image ?? '',
        image_alt: payload.image_alt ?? payload.name,
        description: payload.description ?? '',
        ingredients: payload.ingredients ?? [],
        how_to_use: payload.how_to_use ?? '',
        skin_type: payload.skin_type ?? [],
        expiry_date: payload.expiry_date ?? '',
        sku: payload.sku ?? '',
        product_status: status,
        tags: payload.tags ?? [],
        weight: payload.weight ?? '',
        origin: payload.origin ?? '',
        is_deleted: false,
        is_revoked: false,
        gallery: payload.gallery ?? [],
      };
      const { data, error: e } = await supabase.from('products').insert(row).select('*').single();
      if (e) return { ok: false as const, message: e.message };
      await fetchProducts();
      return { ok: true as const, product: normalizeProductRow(data as Record<string, unknown>) };
    },
    [fetchProducts]
  );

  const updateProduct = useCallback(
    async (id: string, patch: Partial<DbProductRow>) => {
      const supabase = createClient();
      const current = products.find((p) => p.id === id);
      const merged = current ? { ...current, ...patch } : null;
      const nextStatus =
        merged && patch.product_status == null
          ? computeProductStatus(merged.stock, merged.expiry_date)
          : patch.product_status ?? merged?.product_status;

      const { data, error: e } = await supabase
        .from('products')
        .update({
          ...patch,
          ...(patch.product_status == null && merged ? { product_status: nextStatus } : {}),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (e) return { ok: false as const, message: e.message };
      const row = normalizeProductRow(data as Record<string, unknown>);
      await syncInventoryStock(supabase, row);
      await fetchProducts();
      return { ok: true as const, product: row };
    },
    [products, fetchProducts]
  );

  /** Soft delete (sets is_deleted). */
  const softDeleteProduct = useCallback(
    async (id: string) => {
      return updateProduct(id, { is_deleted: true });
    },
    [updateProduct]
  );

  /** Admin restore: clear flags and recompute status from stock/expiry. */
  const restoreProduct = useCallback(
    async (id: string) => {
      const p = products.find((x) => x.id === id);
      if (!p) return { ok: false as const, message: 'Product not found' };
      const status = computeProductStatus(p.stock, p.expiry_date);
      return updateProduct(id, {
        is_deleted: false,
        is_revoked: false,
        product_status: status,
      });
    },
    [products, updateProduct]
  );

  const setRevoked = useCallback(
    async (id: string, revoked: boolean) => {
      return updateProduct(id, { is_revoked: revoked });
    },
    [updateProduct]
  );

  const markExpired = useCallback(
    async (id: string) => {
      return updateProduct(id, { product_status: 'expired' });
    },
    [updateProduct]
  );

  /** Purchase from supplier: positive qty increases stock and logs an event. */
  const recordStockPurchase = useCallback(
    async (opts: {
      productId: string;
      quantityReceived: number;
      supplierName: string;
      note: string;
      actorRole: string;
    }) => {
      const { productId, quantityReceived, supplierName, note, actorRole } = opts;
      if (!shopId || quantityReceived <= 0) return { ok: false as const, message: 'Invalid quantity' };
      const supabase = createClient();
      const p = products.find((x) => x.id === productId);
      if (!p) return { ok: false as const, message: 'Product not found' };

      const newStock = p.stock + quantityReceived;
      const status = computeProductStatus(newStock, p.expiry_date);

      const { error: evErr } = await supabase.from('product_stock_events').insert({
        product_id: productId,
        shop_id: shopId,
        quantity_received: quantityReceived,
        supplier_name: supplierName,
        note,
        recorded_by_role: actorRole,
      });
      if (evErr) return { ok: false as const, message: evErr.message };

      const { error: upErr } = await supabase
        .from('products')
        .update({ stock: newStock, product_status: status })
        .eq('id', productId);
      if (upErr) return { ok: false as const, message: upErr.message };

      await syncInventoryStock(supabase, { ...p, stock: newStock });
      await fetchProducts();
      await fetchStockEvents();
      return { ok: true as const };
    },
    [shopId, products, fetchProducts, fetchStockEvents]
  );

  const appendGalleryUrls = useCallback(
    async (productId: string, urls: string[]) => {
      const p = products.find((x) => x.id === productId);
      if (!p || urls.length === 0) return { ok: false as const, message: 'Nothing to add' };
      const gallery = [...(p.gallery || []), ...urls];
      return updateProduct(productId, { gallery });
    },
    [products, updateProduct]
  );

  return {
    products,
    categories: categories.filter((c) => !c.is_deleted),
    brands: brands.filter((b) => !b.is_deleted),
    categoriesAll: categories,
    brandsAll: brands,
    stockEvents,
    loading,
    error,
    refetch: fetchProducts,
    refetchCategories: fetchCategories,
    refetchBrands: fetchBrands,
    refetchStockEvents: fetchStockEvents,
    insertProduct,
    updateProduct,
    softDeleteProduct,
    restoreProduct,
    setRevoked,
    markExpired,
    recordStockPurchase,
    insertCategory,
    softDeleteCategory,
    insertBrand,
    softDeleteBrand,
    appendGalleryUrls,
  };
}
