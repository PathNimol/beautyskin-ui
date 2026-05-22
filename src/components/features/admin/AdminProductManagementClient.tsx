'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import ConfirmModal from '@/components/ConfirmModel';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useAuthReady } from '@/hooks/useAuthReady';
import DashboardContentSkeleton from '@/components/ui/DashboardContentSkeleton';
import { useRealtimeShops } from '@/hooks/useRealtimeData';
import {
  computeProductStatus,
  useShopProductManagement,
  type DbProductRow,
} from '@/hooks/useShopProductManagement';

type VisibilityFilter = 'all' | 'listed' | 'attention';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
  out_of_stock: 'bg-red-50 text-red-700 border-red-200',
  expiring_soon: 'bg-orange-50 text-orange-700 border-orange-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
};

function splitList(s: string): string[] {
  return s
    .split(/[,|\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

async function tryUploadProductImage(
  file: File,
  _shopId: string
): Promise<{ url: string | null; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string });
    reader.onerror = () => resolve({ url: null, error: 'Failed to read image' });
    reader.readAsDataURL(file);
  });
}

type FormState = {
  name: string;
  brand: string;
  category: string;
  price: string;
  original_price: string;
  stock: string;
  sku: string;
  description: string;
  ingredients: string;
  how_to_use: string;
  skin_type: string;
  expiry_date: string;
  tags: string;
  weight: string;
  origin: string;
  image: string;
  image_alt: string;
};

function productToForm(p: DbProductRow | null): FormState {
  if (!p) {
    return {
      name: '',
      brand: '',
      category: '',
      price: '0',
      original_price: '',
      stock: '0',
      sku: '',
      description: '',
      ingredients: '',
      how_to_use: '',
      skin_type: '',
      expiry_date: '',
      tags: '',
      weight: '',
      origin: '',
      image: '',
      image_alt: '',
    };
  }
  return {
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: String(p.price),
    original_price: p.original_price != null ? String(p.original_price) : '',
    stock: String(p.stock),
    sku: p.sku,
    description: p.description,
    ingredients: p.ingredients.join(', '),
    how_to_use: p.how_to_use,
    skin_type: p.skin_type.join(', '),
    expiry_date: p.expiry_date,
    tags: p.tags.join(', '),
    weight: p.weight,
    origin: p.origin,
    image: p.image,
    image_alt: p.image_alt,
  };
}

export default function AdminProductManagementClient({ shopId }: { shopId: string }) {
  const { role } = useMockAuth();
  const authReady = useAuthReady();
  const { shops } = useRealtimeShops();
  const shop = shops.find((s) => s.id === shopId);

  const {
    products,
    categories,
    brands,
    categoriesAll,
    brandsAll,
    stockEvents,
    loading,
    error,
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
    refetchStockEvents,
  } = useShopProductManagement(shopId);

  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState<VisibilityFilter>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [danger, setDanger] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [catalogTab, setCatalogTab] = useState<'categories' | 'brands'>('categories');
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogName, setCatalogName] = useState('');

  const [editing, setEditing] = useState<DbProductRow | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(() => productToForm(null));
  const [saving, setSaving] = useState(false);

  const [stockModal, setStockModal] = useState<DbProductRow | null>(null);
  const [stockQty, setStockQty] = useState('1');
  const [supplierName, setSupplierName] = useState('');
  const [stockNote, setStockNote] = useState('');

  const [galleryProduct, setGalleryProduct] = useState<DbProductRow | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const showToast = (msg: string, isError = false) => {
    setToast((isError ? 'Error: ' : '') + msg);
    setTimeout(() => setToast(null), 4500);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      const attention = p.is_deleted || p.is_revoked || p.product_status === 'expired';
      const listed = !p.is_deleted && !p.is_revoked;
      const matchVis =
        visibility === 'all' ||
        (visibility === 'listed' && listed) ||
        (visibility === 'attention' && attention);
      return matchSearch && matchVis;
    });
  }, [products, search, visibility]);

  const openNew = () => {
    setEditing('new');
    setForm(productToForm(null));
  };

  const openEdit = (p: DbProductRow) => {
    setEditing(p);
    setForm(productToForm(p));
  };

  const saveProduct = async () => {
    if (!shopId) return;
    if (!form.name.trim()) {
      showToast('Product name is required', true);
      return;
    }
    if (!editing) {
      showToast('Nothing to save', true);
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category.trim(),
      price: Number(form.price) || 0,
      original_price: form.original_price.trim() === '' ? null : Number(form.original_price),
      stock: Number(form.stock) || 0,
      sku: form.sku.trim(),
      description: form.description,
      ingredients: splitList(form.ingredients),
      how_to_use: form.how_to_use,
      skin_type: splitList(form.skin_type),
      expiry_date: form.expiry_date.trim(),
      tags: splitList(form.tags),
      weight: form.weight.trim(),
      origin: form.origin.trim(),
      image: form.image.trim(),
      image_alt: form.image_alt.trim() || form.name.trim(),
    };

    if (editing === 'new') {
      const st = computeProductStatus(payload.stock, payload.expiry_date);
      const res = await insertProduct({
        ...payload,
        shop_id: shopId,
        product_status: st,
      });
      setSaving(false);
      if (!res.ok) showToast(res.message, true);
      else {
        showToast('Product created');
        setEditing(null);
      }
      return;
    }

    if (editing) {
      const st = computeProductStatus(payload.stock, payload.expiry_date);
      const res = await updateProduct(editing.id, {
        ...payload,
        product_status: st,
      });
      setSaving(false);
      if (!res.ok) showToast(res.message, true);
      else {
        showToast('Product updated');
        setEditing(null);
      }
    }
  };

  const handleCatalogAdd = async () => {
    if (!catalogName.trim()) return;
    if (catalogTab === 'categories') {
      const r = await insertCategory(catalogName);
      if (!r.ok) showToast(r.message, true);
      else {
        showToast('Category added');
        setCatalogName('');
      }
    } else {
      const r = await insertBrand(catalogName);
      if (!r.ok) showToast(r.message, true);
      else {
        showToast('Brand added');
        setCatalogName('');
      }
    }
  };

  const handleStockSave = async () => {
    if (!stockModal) return;
    const qty = Number(stockQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      showToast('Enter a positive quantity', true);
      return;
    }
    const res = await recordStockPurchase({
      productId: stockModal.id,
      quantityReceived: qty,
      supplierName: supplierName.trim(),
      note: stockNote.trim(),
      actorRole: role || 'admin',
    });
    if (!res.ok) showToast(res.message, true);
    else {
      showToast('Stock updated (supplier purchase recorded)');
      setStockModal(null);
      setStockQty('1');
      setSupplierName('');
      setStockNote('');
    }
  };

  const onGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!galleryProduct || !files?.length) return;
    setGalleryUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const { url, error: upErr } = await tryUploadProductImage(file, shopId);
      if (upErr || !url) {
        showToast(
          upErr ||
            'Upload failed — create a public "product-images" bucket in Supabase Storage, or paste image URLs in the product form.',
          true
        );
        setGalleryUploading(false);
        e.target.value = '';
        return;
      }
      urls.push(url);
    }
    const res = await appendGalleryUrls(galleryProduct.id, urls);
    setGalleryUploading(false);
    e.target.value = '';
    if (!res.ok) showToast(res.message, true);
    else {
      showToast('Images added to gallery');
      setGalleryProduct((prev) =>
        prev ? { ...prev, gallery: [...(prev.gallery || []), ...urls] } : null
      );
    }
  };

  if (!authReady) {
    return (
      <div className="p-8">
        <DashboardContentSkeleton />
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">
          Product administration is limited to the admin role.
        </p>
        <Link
          href="/admin/shops"
          className="text-sm font-semibold text-rose-deep mt-2 inline-block"
        >
          Back to shops
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-admin-bg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pl-10 md:pl-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/admin/shops" className="hover:text-foreground">
              Shops
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {shop?.name || 'Shop'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Product management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Catalog is scoped to this shop. Deletes are soft (
            <code className="text-xs">is_deleted</code>); you see removed and active items and can
            restore after staff expiry or revoke actions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowCatalog(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground text-sm font-bold rounded-xl hover:bg-secondary transition-all"
          >
            <Icon name="TagIcon" size={16} />
            Categories & brands
          </button>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
          >
            <Icon name="PlusIcon" size={16} />
            Add product
          </button>
        </div>
      </div>

      {toast && (
        <div className="mb-4 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground">
          {toast}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
          <p className="text-xs mt-1 opacity-90">
            If columns are missing, apply the latest Supabase migration (admin product management).
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Icon
            name="MagnifyingGlassIcon"
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search name, brand, SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm"
          />
        </div>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as VisibilityFilter)}
          className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm"
        >
          <option value="all">All rows (incl. soft-deleted)</option>
          <option value="listed">Listed only (not deleted / not revoked)</option>
          <option value="attention">Needs attention (deleted, revoked, or expired)</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                  SKU
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Price
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                  Expiry
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-muted-foreground">
                    Loading products…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-muted-foreground">
                    No products match filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shrink-0 bg-secondary">
                          {p.image ? (
                            <AppImage
                              src={p.image}
                              alt={p.image_alt}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="PhotoIcon" size={18} className="text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-snug max-w-[220px] truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{p.brand}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.is_deleted && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                                Deleted
                              </span>
                            )}
                            {p.is_revoked && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                Revoked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs font-mono text-muted-foreground">
                      {p.sku}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold">{p.stock}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                      {p.expiry_date || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[p.product_status] || STATUS_STYLES.active}`}
                      >
                        {STATUS_LABELS[p.product_status] || p.product_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(p)}
                          className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10"
                        >
                          <Icon name="PencilIcon" size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          title="Purchase stock"
                          onClick={() => {
                            setStockModal(p);
                            refetchStockEvents();
                          }}
                          className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10"
                        >
                          <Icon name="TruckIcon" size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          title="Gallery"
                          onClick={() => setGalleryProduct(p)}
                          className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10"
                        >
                          <Icon name="PhotoIcon" size={14} className="text-muted-foreground" />
                        </button>
                        {(p.is_deleted || p.is_revoked || p.product_status === 'expired') && (
                          <button
                            type="button"
                            title="Restore"
                            onClick={async () => {
                              const r = await restoreProduct(p.id);
                              if (!r.ok) showToast(r.message, true);
                              else showToast('Product restored');
                            }}
                            className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center hover:bg-green-100 border border-green-200"
                          >
                            <Icon name="ArrowPathIcon" size={14} className="text-green-700" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Soft delete"
                          onClick={() =>
                            setDanger({
                              title: 'Soft-delete product?',
                              message:
                                'The row stays in the database with is_deleted = true. Admin can restore it later.',
                              onConfirm: async () => {
                                const r = await softDeleteProduct(p.id);
                                setDanger(null);
                                if (!r.ok) showToast(r.message, true);
                                else showToast('Product marked deleted');
                              },
                            })
                          }
                          className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-red-50"
                        >
                          <Icon name="TrashIcon" size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          title="Revoke"
                          onClick={async () => {
                            const r = await setRevoked(p.id, !p.is_revoked);
                            if (!r.ok) showToast(r.message, true);
                            else showToast(p.is_revoked ? 'Revoke cleared' : 'Marked revoked');
                          }}
                          className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-purple-50 text-[10px] font-bold"
                        >
                          R
                        </button>
                        <button
                          type="button"
                          title="Expire"
                          onClick={async () => {
                            const r = await markExpired(p.id);
                            if (!r.ok) showToast(r.message, true);
                            else showToast('Marked expired');
                          }}
                          className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-amber-50 text-[10px] font-bold"
                        >
                          E
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent stock events */}
      <div className="mt-8 bg-card border border-border rounded-2xl p-5 shadow-card">
        <h2 className="text-sm font-bold text-foreground mb-3">Recent supplier stock receipts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="pb-2">When</th>
                <th className="pb-2">Product</th>
                <th className="pb-2">Qty</th>
                <th className="pb-2">Supplier</th>
                <th className="pb-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {stockEvents.slice(0, 12).map((ev) => {
                const pname = products.find((x) => x.id === ev.product_id)?.name || ev.product_id;
                return (
                  <tr key={ev.id} className="border-b border-border/40">
                    <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(ev.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 text-xs font-medium">{pname}</td>
                    <td className="py-2 text-xs font-bold">+{ev.quantity_received}</td>
                    <td className="py-2 text-xs">{ev.supplier_name || '—'}</td>
                    <td className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                      {ev.note || '—'}
                    </td>
                  </tr>
                );
              })}
              {stockEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-xs text-muted-foreground">
                    No purchase events yet. Use the truck icon on a product to record stock from a
                    supplier.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => !saving && setEditing(null)}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-bold text-foreground">
                {editing === 'new' ? 'Add product' : 'Edit product'}
              </h2>
              <button
                type="button"
                onClick={() => !saving && setEditing(null)}
                className="p-2 rounded-lg hover:bg-secondary"
              >
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Name *
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Brand
                  </label>
                  <input
                    list="brand-options"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  />
                  <datalist id="brand-options">
                    {brands.map((b) => (
                      <option key={b.id} value={b.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Category
                  </label>
                  <input
                    list="cat-options"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  />
                  <datalist id="cat-options">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Original price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.original_price}
                    onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Opening stock
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    disabled={editing !== 'new'}
                    title={
                      editing !== 'new'
                        ? 'Use “Purchase stock” on the grid to add inventory from suppliers'
                        : undefined
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    SKU
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Expiry date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={
                      form.expiry_date.length >= 10
                        ? form.expiry_date.slice(0, 10)
                        : form.expiry_date
                    }
                    onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Primary image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      value={form.image}
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                      placeholder="https://…"
                    />
                    <label className="shrink-0 px-3 py-2 rounded-xl border border-border bg-secondary text-xs font-bold cursor-pointer hover:bg-border">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const { url, error: upErr } = await tryUploadProductImage(file, shopId);
                          e.target.value = '';
                          if (!url) showToast(upErr || 'Upload failed', true);
                          else setForm((f) => ({ ...f, image: url }));
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Image alt
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.image_alt}
                    onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Ingredients (comma)
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.ingredients}
                    onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Skin types (comma)
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.skin_type}
                    onChange={(e) => setForm((f) => ({ ...f, skin_type: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    How to use
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.how_to_use}
                    onChange={(e) => setForm((f) => ({ ...f, how_to_use: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Tags (comma)
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Weight
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.weight}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Origin
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                    value={form.origin}
                    onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-secondary rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProduct}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary rounded-xl text-sm font-bold shadow-rose disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock purchase */}
      {stockModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setStockModal(null)}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-foreground mb-1">Purchase stock from supplier</h3>
            <p className="text-xs text-muted-foreground mb-4">{stockModal.name}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                  Quantity received
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                  Supplier name
                </label>
                <input
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                  Note
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setStockModal(null)}
                className="flex-1 py-2.5 bg-secondary rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStockSave}
                className="flex-1 py-2.5 bg-primary rounded-xl text-sm font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      {galleryProduct && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => !galleryUploading && setGalleryProduct(null)}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="font-bold text-foreground mb-1">Product images</h3>
            <p className="text-xs text-muted-foreground mb-4">{galleryProduct.name}</p>
            <p className="text-xs text-muted-foreground mb-3">
              Primary image is edited in the product form. Here you add extra gallery URLs (stored
              in <code className="text-[10px]">gallery</code>).
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(galleryProduct.gallery || []).map((url) => (
                <div
                  key={url}
                  className="w-16 h-16 rounded-lg overflow-hidden border border-border"
                >
                  <AppImage
                    src={url}
                    alt=""
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
              {(!galleryProduct.gallery || galleryProduct.gallery.length === 0) && (
                <p className="text-xs text-muted-foreground">No gallery images yet.</p>
              )}
            </div>
            <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border cursor-pointer hover:bg-secondary text-sm font-semibold">
              {galleryUploading ? 'Uploading…' : 'Upload images'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={galleryUploading}
                onChange={onGalleryFiles}
              />
            </label>
            <button
              type="button"
              onClick={() => setGalleryProduct(null)}
              className="mt-4 w-full py-2.5 bg-secondary rounded-xl text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Categories / brands */}
      {showCatalog && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setShowCatalog(false)}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Shop catalog</h3>
              <button
                type="button"
                onClick={() => setShowCatalog(false)}
                className="p-2 rounded-lg hover:bg-secondary"
              >
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              {(['categories', 'brands'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCatalogTab(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize ${
                    catalogTab === t ? 'bg-primary' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                placeholder={`New ${catalogTab === 'categories' ? 'category' : 'brand'} name`}
                value={catalogName}
                onChange={(e) => setCatalogName(e.target.value)}
              />
              <button
                type="button"
                onClick={handleCatalogAdd}
                className="px-4 py-2 rounded-xl bg-primary text-sm font-bold"
              >
                Add
              </button>
            </div>
            <ul className="divide-y divide-border text-sm">
              {(catalogTab === 'categories' ? categoriesAll : brandsAll).map((row) => (
                <li key={row.id} className="py-2 flex items-center justify-between gap-2">
                  <span className={row.is_deleted ? 'line-through text-muted-foreground' : ''}>
                    {row.name}
                  </span>
                  {!row.is_deleted && (
                    <button
                      type="button"
                      className="text-[10px] font-bold text-red-600"
                      onClick={async () => {
                        const ok =
                          catalogTab === 'categories'
                            ? await softDeleteCategory(row.id)
                            : await softDeleteBrand(row.id);
                        if (ok) showToast('Removed from picker (soft-deleted)');
                        else showToast('Could not remove', true);
                      }}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {danger && (
        <ConfirmModal
          title={danger.title}
          message={danger.message}
          confirmLabel="Confirm"
          variant="danger"
          onConfirm={danger.onConfirm}
          onClose={() => setDanger(null)}
        />
      )}
    </div>
  );
}
