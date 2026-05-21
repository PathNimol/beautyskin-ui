'use client';

import { useCallback, useEffect, useState } from 'react';
import { inventoryApi, productsApi } from '@/lib/api';
import type { ApiProduct } from '@/lib/api/types';

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

function mapStatusFromApi(status: string, stock: number, expiryDate: string): DbProductStatus {
  const s = status?.toUpperCase() || '';
  if (s === 'REVOKED') return 'active';
  if (s === 'INACTIVE' || s === 'DELETED') return 'out_of_stock';
  if (s === 'EXPIRED') return 'expired';
  if (s === 'LOW_STOCK') return 'low_stock';
  if (s === 'OUT_OF_STOCK') return 'out_of_stock';
  if (s === 'EXPIRING_SOON') return 'expiring_soon';
  return computeProductStatus(stock, expiryDate);
}

function apiToRow(p: ApiProduct): DbProductRow {
  const stock = Number(p.stock) || 0;
  const expiry = p.expiryDate || '';
  return {
    id: p.id,
    shop_id: p.shopId || null,
    name: p.name,
    brand: p.brand || '',
    category: p.category || '',
    price: Number(p.price) || 0,
    original_price: p.originalPrice != null ? Number(p.originalPrice) : null,
    stock,
    sold: Number(p.sold) || 0,
    rating: Number(p.rating) || 0,
    review_count: Number(p.reviewCount) || 0,
    image: p.image || '',
    image_alt: p.imageAlt || p.name,
    description: p.description || '',
    ingredients: p.ingredients || [],
    how_to_use: p.howToUse || '',
    skin_type: p.skinTypes || [],
    expiry_date: expiry,
    sku: p.sku || '',
    product_status: mapStatusFromApi(p.status, stock, expiry),
    tags: p.tags || [],
    weight: p.weight || '',
    origin: p.origin || '',
    created_at: '',
    updated_at: '',
    is_deleted: p.status?.toUpperCase() === 'INACTIVE' && !p.visible,
    is_revoked: p.status?.toUpperCase() === 'REVOKED',
    gallery: (p.images || []).map((i) => i.src),
  };
}

function rowToPayload(patch: Partial<DbProductRow>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.name != null) body.name = patch.name;
  if (patch.brand != null) body.brand = patch.brand;
  if (patch.category != null) body.category = patch.category;
  if (patch.price != null) body.price = patch.price;
  if (patch.original_price !== undefined) body.originalPrice = patch.original_price;
  if (patch.stock != null) body.stock = patch.stock;
  if (patch.image != null) body.image = patch.image;
  if (patch.image_alt != null) body.imageAlt = patch.image_alt;
  if (patch.description != null) body.description = patch.description;
  if (patch.ingredients != null) body.ingredients = patch.ingredients;
  if (patch.how_to_use != null) body.howToUse = patch.how_to_use;
  if (patch.skin_type != null) body.skinTypes = patch.skin_type;
  if (patch.expiry_date != null) body.expiryDate = patch.expiry_date;
  if (patch.sku != null) body.sku = patch.sku;
  if (patch.tags != null) body.tags = patch.tags;
  if (patch.weight != null) body.weight = patch.weight;
  if (patch.origin != null) body.origin = patch.origin;
  if (patch.is_revoked != null) body.status = patch.is_revoked ? 'REVOKED' : 'ACTIVE';
  if (patch.is_deleted === true) body.status = 'INACTIVE';
  if (patch.is_deleted === false) body.status = 'ACTIVE';
  if (patch.product_status === 'expired') body.status = 'EXPIRED';
  return body;
}

export function useShopProductManagement(shopId: string | undefined) {
  const [products, setProducts] = useState<DbProductRow[]>([]);
  const [categories, setCategories] = useState<DbShopCategory[]>([]);
  const [brands, setBrands] = useState<DbShopBrand[]>([]);
  const [stockEvents, setStockEvents] = useState<DbProductStockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deriveTaxonomy = useCallback((rows: DbProductRow[]) => {
    if (!shopId) return;
    const catNames = [...new Set(rows.map((p) => p.category).filter(Boolean))];
    const brandNames = [...new Set(rows.map((p) => p.brand).filter(Boolean))];
    const now = new Date().toISOString();
    setCategories(
      catNames.map((name, i) => ({
        id: `cat-${i}`,
        shop_id: shopId,
        name,
        is_deleted: false,
        created_at: now,
        updated_at: now,
      }))
    );
    setBrands(
      brandNames.map((name, i) => ({
        id: `brand-${i}`,
        shop_id: shopId,
        name,
        is_deleted: false,
        created_at: now,
        updated_at: now,
      }))
    );
  }, [shopId]);

  const fetchProducts = useCallback(async () => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const page = await productsApi.listMerchant(shopId, { limit: 500 });
      const rows = (page.content || []).map(apiToRow);
      setProducts(rows);
      deriveTaxonomy(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, deriveTaxonomy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const insertCategory = useCallback(async (name: string) => {
    if (!shopId || !name.trim()) return { ok: false as const, message: 'Name required' };
    const now = new Date().toISOString();
    setCategories((prev) => [
      ...prev,
      { id: `cat-${Date.now()}`, shop_id: shopId, name: name.trim(), is_deleted: false, created_at: now, updated_at: now },
    ]);
    return { ok: true as const };
  }, [shopId]);

  const softDeleteCategory = useCallback(async (id: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, is_deleted: true } : c)));
    return true;
  }, []);

  const insertBrand = useCallback(async (name: string) => {
    if (!shopId || !name.trim()) return { ok: false as const, message: 'Name required' };
    const now = new Date().toISOString();
    setBrands((prev) => [
      ...prev,
      { id: `brand-${Date.now()}`, shop_id: shopId, name: name.trim(), is_deleted: false, created_at: now, updated_at: now },
    ]);
    return { ok: true as const };
  }, [shopId]);

  const softDeleteBrand = useCallback(async (id: string) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, is_deleted: true } : b)));
    return true;
  }, []);

  const insertProduct = useCallback(
    async (payload: Partial<DbProductRow> & { name: string; shop_id: string }) => {
      if (!payload.shop_id) return { ok: false as const, message: 'Shop required' };
      try {
        const created = await productsApi.createProduct(payload.shop_id, {
          name: payload.name,
          brand: payload.brand,
          category: payload.category,
          price: payload.price ?? 0,
          originalPrice: payload.original_price ?? undefined,
          stock: payload.stock ?? 0,
          image: payload.image,
          imageAlt: payload.image_alt,
          description: payload.description,
          sku: payload.sku,
          status: 'ACTIVE',
          visible: true,
          tags: payload.tags,
          weight: payload.weight,
          origin: payload.origin,
        });
        await fetchProducts();
        return { ok: true as const, product: apiToRow(created) };
      } catch (e) {
        return { ok: false as const, message: e instanceof Error ? e.message : 'Create failed' };
      }
    },
    [fetchProducts]
  );

  const updateProduct = useCallback(
    async (id: string, patch: Partial<DbProductRow>) => {
      const sid = shopId || products.find((p) => p.id === id)?.shop_id;
      if (!sid) return { ok: false as const, message: 'Shop required' };
      try {
        const updated = await productsApi.updateProduct(sid, id, rowToPayload(patch));
        await fetchProducts();
        return { ok: true as const, product: apiToRow(updated) };
      } catch (e) {
        return { ok: false as const, message: e instanceof Error ? e.message : 'Update failed' };
      }
    },
    [shopId, products, fetchProducts]
  );

  const softDeleteProduct = useCallback(
    async (id: string) => {
      const sid = shopId;
      if (!sid) return { ok: false as const, message: 'Shop required' };
      try {
        await productsApi.deleteProduct(sid, id);
        await fetchProducts();
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, message: e instanceof Error ? e.message : 'Delete failed' };
      }
    },
    [shopId, fetchProducts]
  );

  const restoreProduct = useCallback(
    async (id: string) => updateProduct(id, { is_deleted: false, is_revoked: false }),
    [updateProduct]
  );

  const setRevoked = useCallback(
    async (id: string, revoked: boolean) => updateProduct(id, { is_revoked: revoked }),
    [updateProduct]
  );

  const markExpired = useCallback(
    async (id: string) => updateProduct(id, { product_status: 'expired' }),
    [updateProduct]
  );

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
      const p = products.find((x) => x.id === productId);
      if (!p) return { ok: false as const, message: 'Product not found' };

      const newStock = p.stock + quantityReceived;
      const res = await updateProduct(productId, { stock: newStock });
      if (!res.ok) return res;

      setStockEvents((prev) => [
        {
          id: `evt-${Date.now()}`,
          product_id: productId,
          shop_id: shopId,
          quantity_received: quantityReceived,
          supplier_name: supplierName,
          note,
          recorded_by_role: actorRole,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      try {
        const inv = await inventoryApi.listInventory(shopId, { search: p.sku, limit: 5 });
        const item = inv.content?.find((i) => i.productId === productId || i.sku === p.sku);
        if (item?.id) await inventoryApi.restock(item.id, quantityReceived);
      } catch {
        // inventory sync is best-effort
      }

      return { ok: true as const };
    },
    [shopId, products, updateProduct]
  );

  const appendGalleryUrls = useCallback(
    async (productId: string, urls: string[]) => {
      const p = products.find((x) => x.id === productId);
      if (!p || urls.length === 0) return { ok: false as const, message: 'Nothing to add' };
      return updateProduct(productId, { gallery: [...(p.gallery || []), ...urls] });
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
    refetchCategories: fetchProducts,
    refetchBrands: fetchProducts,
    refetchStockEvents: async () => {},
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
