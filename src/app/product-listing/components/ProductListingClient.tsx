'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import CatalogPagination from '@/components/ui/CatalogPagination';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';
import { type CatalogProduct } from '@/lib/mock/productCatalog';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { shopsApi, type ApiShop } from '@/lib/api';

const CATEGORY_OPTIONS = [
  'All',
  'Serums',
  'Moisturizers',
  'Cleansers',
  'Sunscreen',
  'Eye Care',
  'Masks & Treatments',
  'Makeup',
];

const SORT_OPTIONS = [
  'Featured',
  'Price: Low to High',
  'Price: High to Low',
  'Best Rated',
  'Newest',
];

const PRICE_RANGES = [
  {
    label: 'All Prices',
    min: undefined as number | undefined,
    max: undefined as number | undefined,
  },
  { label: 'Under $20', min: 0, max: 20 },
  { label: '$20 – $35', min: 20, max: 35 },
  { label: '$35 – $50', min: 35, max: 50 },
  { label: '$50+', min: 50, max: undefined },
];

const badgeStyles: Record<string, string> = {
  rose: 'bg-rose-light/90 text-rose-deep border border-primary/30 backdrop-blur-sm',
  accent: 'bg-accent/20 text-gold-deep border border-accent/40 backdrop-blur-sm',
  sale: 'bg-red-500/90 text-white border-0 backdrop-blur-sm',
  info: 'bg-blue-500/90 text-white border-0 backdrop-blur-sm',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? 'text-accent' : 'text-border'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-56 bg-secondary" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 rounded bg-secondary" />
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-3 w-24 rounded bg-secondary" />
        <div className="h-8 w-20 rounded bg-secondary" />
        <div className="h-11 rounded-xl bg-secondary" />
      </div>
    </div>
  );
}

// ─── Shop Dropdown (toolbar) ──────────────────────────────────────────────────
function ShopDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const label = options.find((o) => o.id === value)?.name ?? 'All Shops';

  return (
    <div ref={ref} className="relative w-full min-w-[160px] max-w-fit">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-[48px] w-full items-center justify-between gap-2 rounded-2xl border border-border bg-card py-3 pl-4 pr-3 text-sm text-foreground shadow-card outline-none transition-colors focus:border-primary"
      >
        <span className="truncate">{label}</span>
        <span
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <Icon name="ChevronDownIcon" size={16} />
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        >
          {options.map((o) => (
            <li
              key={o.id}
              role="option"
              aria-selected={o.id === value}
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
              className={`cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-secondary
                ${o.id === value ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
            >
              {o.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductListingClient({ embedded = false }: { embedded?: boolean }) {
  const { addItem } = useCart();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeShopId, setActiveShopId] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activePriceRange, setActivePriceRange] = useState(0);
  const [activeSort, setActiveSort] = useState<string>('Featured');
  const [cartAdded, setCartAdded] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const priceRange = PRICE_RANGES[activePriceRange];

  // Load shop list for the toolbar dropdown
  const [shopOptions, setShopOptions] = useState<{ id: string; name: string }[]>([
    { id: 'All', name: 'All Shops' },
  ]);
  useEffect(() => {
    shopsApi
      .listShops({ status: 'active', limit: 50 })
      .then((data) => {
        const shops = data.content.map((s: ApiShop) => ({ id: s.id, name: s.name }));
        setShopOptions([{ id: 'All', name: 'All Shops' }, ...shops]);
      })
      .catch(() => {
        /* keep "All Shops" fallback */
      });
  }, []);

  const activeShopName = shopOptions.find((s) => s.id === activeShopId)?.name ?? 'All Shops';

  // Parallel shop-name search — matched shop IDs feed into catalogParams
  const [matchedShopIds, setMatchedShopIds] = useState<string[]>([]);
  useEffect(() => {
    if (!searchQuery) {
      setMatchedShopIds([]);
      return;
    }
    shopsApi
      .listShops({ search: searchQuery, status: 'active', limit: 50 })
      .then((data) => setMatchedShopIds(data.content.map((s: ApiShop) => s.id)))
      .catch(() => setMatchedShopIds([]));
  }, [searchQuery]);

  const catalogParams = useMemo(
    () => ({
      search: searchQuery || undefined,
      category: activeCategory !== 'All' ? activeCategory : undefined,
      shopId:
        activeShopId !== 'All'
          ? activeShopId
          : matchedShopIds.length === 1
            ? matchedShopIds[0]
            : undefined,
      shopIds: activeShopId === 'All' && matchedShopIds.length > 1 ? matchedShopIds : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sort: activeSort,
    }),
    [
      searchQuery,
      activeCategory,
      activeShopId,
      matchedShopIds,
      priceRange.min,
      priceRange.max,
      activeSort,
    ]
  );

  const { products, loading, error, page, setPage, totalElements, totalPages, pageSize } =
    useCatalogProducts(catalogParams);

  const productDetailBase = '/customer/products';

  const handlePageChange = useCallback(
    (next: number) => {
      setPage(next);
      document
        .getElementById('catalog-grid-top')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [setPage]
  );

  const handleAddToCart = useCallback(
    (product: CatalogProduct, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!product.inStock || product.stock === 0) return;
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        alt: product.alt,
        shopId: product.shopId,
        shopName: product.shopName,
      });
      setCartAdded((prev) => [...prev, product.id]);
      setTimeout(() => setCartAdded((prev) => prev.filter((x) => x !== product.id)), 2000);
    },
    [addItem]
  );

  const clearFilters = () => {
    setActiveShopId('All');
    setActiveCategory('All');
    setActivePriceRange(0);
    setActiveSort('Featured');
    setSearchInput('');
    setSearchQuery('');
  };

  const hasActiveFilters =
    activeShopId !== 'All' ||
    activeCategory !== 'All' ||
    activePriceRange !== 0 ||
    searchQuery.length > 0 ||
    activeSort !== 'Featured';

  return (
    <div className={embedded ? '' : 'min-h-screen bg-background'}>
      {!embedded && (
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-secondary/80 via-background to-accent/5 px-6 py-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <span>/</span>
              <span className="font-medium text-foreground">Products</span>
            </div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              All Products
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Curated K-beauty and skincare from every shop — filter, sort, and browse page by page.
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ── Search + shop dropdown ── */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Icon
              name="MagnifyingGlassIcon"
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              placeholder="Search products, brands or shops..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground shadow-card transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <ShopDropdown value={activeShopId} onChange={setActiveShopId} options={shopOptions} />
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex min-h-[48px] shrink-0 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-card md:hidden"
            >
              <Icon name="FunnelIcon" size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active filters
            </span>
            {activeCategory !== 'All' && (
              <span className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold text-foreground">
                {activeCategory}
              </span>
            )}
            {activeShopId !== 'All' && (
              <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold text-foreground">
                <Icon name="BuildingStorefrontIcon" size={11} />
                {activeShopName}
              </span>
            )}
            {activePriceRange !== 0 && (
              <span className="rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-semibold text-gold-deep">
                {PRICE_RANGES[activePriceRange].label}
              </span>
            )}
            {searchQuery && (
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold">
                &quot;{searchQuery}&quot;
              </span>
            )}
            {activeSort !== 'Featured' && (
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                ↕ {activeSort}
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-deep underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Main layout: flex-col so pagination spans full width below ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-8">
            {/* ── Desktop sidebar ── */}
            <aside className="hidden w-60 shrink-0 md:block">
              <div className="max-h-svh overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="space-y-6">
                  {/* Category */}
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Category
                    </h3>
                    <div className="flex flex-col gap-1">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                            activeCategory === cat
                              ? 'border border-primary/30 bg-primary/20 font-semibold text-foreground'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Price
                    </h3>
                    <div className="flex flex-col gap-1">
                      {PRICE_RANGES.map((pr, idx) => (
                        <button
                          key={pr.label}
                          type="button"
                          onClick={() => setActivePriceRange(idx)}
                          className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                            activePriceRange === idx
                              ? 'border border-accent/30 bg-accent/15 font-semibold text-gold-deep'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          {pr.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Sort By
                    </h3>
                    <div className="flex flex-col gap-1">
                      {SORT_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setActiveSort(s)}
                          className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                            activeSort === s
                              ? 'border border-primary/30 bg-primary/20 font-semibold text-foreground'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Mobile filter drawer ── */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-[100] md:hidden">
                <div
                  className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden
                />
                <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-card p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">Filters</h3>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="rounded-lg p-2 hover:bg-secondary"
                    >
                      <Icon name="XMarkIcon" size={20} />
                    </button>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Category
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setActiveCategory(cat);
                            setSidebarOpen(false);
                          }}
                          className={`rounded-full px-4 py-2 text-sm font-medium ${
                            activeCategory === cat
                              ? 'bg-primary text-foreground'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Price
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_RANGES.map((pr, idx) => (
                        <button
                          key={pr.label}
                          type="button"
                          onClick={() => {
                            setActivePriceRange(idx);
                            setSidebarOpen(false);
                          }}
                          className={`rounded-full px-4 py-2 text-sm font-medium ${
                            activePriceRange === idx
                              ? 'bg-accent/20 text-gold-deep'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {pr.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Sort By
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {SORT_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setActiveSort(s);
                            setSidebarOpen(false);
                          }}
                          className={`rounded-full px-4 py-2 text-sm font-medium ${
                            activeSort === s
                              ? 'bg-primary text-foreground'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Product grid ── */}
            <div id="catalog-grid-top" className="min-w-0 flex-1 h-[720px] overflow-y-auto pr-1">
              <div className="mb-5">
                <p className="text-sm text-muted-foreground">
                  <span className="text-lg font-extrabold text-foreground">{totalElements}</span>{' '}
                  products
                  {totalPages > 1 && (
                    <span>
                      {' '}
                      · page <span className="font-semibold text-foreground">{page}</span> of{' '}
                      <span className="font-semibold text-foreground">{totalPages}</span>
                    </span>
                  )}
                </p>
              </div>

              {error && !loading && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                    <Icon name="MagnifyingGlassIcon" size={28} className="text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">No products found</h3>
                  <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    Try adjusting your filters or search term.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-foreground shadow-rose transition-all hover:bg-rose-deep hover:text-white"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`${productDetailBase}/${product.id}`}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-rose"
                    >
                      <div className="relative h-56 overflow-hidden bg-secondary">
                        <AppImage
                          src={product.image}
                          alt={product.alt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.badge && (
                          <span
                            className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[product.badgeType ?? 'rose']}`}
                          >
                            {product.badge}
                          </span>
                        )}
                        {!product.inStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50 backdrop-blur-[2px]">
                            <span className="rounded-lg bg-card px-3 py-1.5 text-xs font-bold">
                              Out of stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                          {product.brand}
                        </p>
                        <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-rose-deep">
                          {product.name}
                        </h3>
                        <div className="mb-2 flex items-center gap-2">
                          <StarRating rating={product.rating} />
                          <span className="text-xs text-muted-foreground">
                            {product.rating} ({product.reviews.toLocaleString()})
                          </span>
                        </div>
                        {product.shopName && (
                          <p className="mb-2 text-[10px] text-muted-foreground">
                            {product.shopName}
                          </p>
                        )}
                        <div className="mt-auto flex items-baseline gap-2 pt-2">
                          <span className="text-xl font-extrabold text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice != null && (
                            <span className="text-xs text-muted-foreground line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={!product.inStock}
                          className={`mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                            !product.inStock
                              ? 'cursor-not-allowed bg-muted text-muted-foreground'
                              : cartAdded.includes(product.id)
                                ? 'bg-green-600 text-white'
                                : 'bg-primary text-foreground shadow-rose hover:bg-rose-deep hover:text-white'
                          }`}
                        >
                          {cartAdded.includes(product.id) ? (
                            <>
                              <Icon name="CheckIcon" size={15} /> Added
                            </>
                          ) : (
                            <>
                              <Icon name="ShoppingBagIcon" size={15} /> Add to cart
                            </>
                          )}
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pagination spans full width of sidebar + gap + grid */}
          <CatalogPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
