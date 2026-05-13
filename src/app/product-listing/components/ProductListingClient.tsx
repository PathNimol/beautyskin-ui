'use client';
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

// ─── Data ───────────────────────────────────────────────────────────────────

const categories = ['All', 'Moisturizers', 'Serums', 'Cleansers', 'Sunscreen', 'Eye Care', 'Masks'];
const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Best Rated', 'Newest'];
const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $20', min: 0, max: 20 },
  { label: '$20 – $35', min: 20, max: 35 },
  { label: '$35 – $50', min: 35, max: 50 },
  { label: '$50+', min: 50, max: Infinity },
];

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  alt: string;
  badge: string | null;
  badgeType: string | null;
  category: string;
  inStock: boolean;
  isNew: boolean;
  stock: number;
}

const allProducts: Product[] = [
  { id: 1, name: 'Glow Essence Serum', brand: 'COSRX', price: 28.99, originalPrice: 38.99, rating: 4.9, reviews: 1247, image: "https://img.rocket.new/generatedImages/rocket_gen_img_14ffa882d-1773310521963.png", alt: 'Clear glass serum bottle with white dropper cap on soft pink background', badge: 'Best Seller', badgeType: 'rose', category: 'Serums', inStock: true, isNew: false, stock: 42 },
  { id: 2, name: 'Hydra Barrier Cream', brand: 'Laneige', price: 34.00, originalPrice: null, rating: 4.8, reviews: 893, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e9fd727b-1772071563202.png", alt: 'White cream jar with minimalist label on marble surface with soft shadows', badge: 'New', badgeType: 'accent', category: 'Moisturizers', inStock: true, isNew: true, stock: 8 },
  { id: 3, name: 'Snail Mucin Essence', brand: 'COSRX', price: 22.50, originalPrice: 29.00, rating: 4.9, reviews: 2103, image: "https://img.rocket.new/generatedImages/rocket_gen_img_10ac1dfcb-1772216203794.png", alt: 'Translucent essence bottle with minimalist Korean label on clean white background', badge: '22% OFF', badgeType: 'sale', category: 'Serums', inStock: true, isNew: false, stock: 65 },
  { id: 4, name: 'Gentle Foam Cleanser', brand: 'Innisfree', price: 15.99, originalPrice: null, rating: 4.7, reviews: 654, image: "https://images.unsplash.com/photo-1695561115616-b4b719f1a242", alt: 'Green foam cleanser tube with botanical design on light beige background', badge: null, badgeType: null, category: 'Cleansers', inStock: true, isNew: false, stock: 3 },
  { id: 5, name: 'UV Shield SPF 50+', brand: 'Skin1004', price: 19.99, originalPrice: 24.99, rating: 4.8, reviews: 421, image: "https://img.rocket.new/generatedImages/rocket_gen_img_121d6c73f-1772074800330.png", alt: 'White sunscreen tube with minimal packaging on light cream background', badge: '20% OFF', badgeType: 'sale', category: 'Sunscreen', inStock: true, isNew: false, stock: 27 },
  { id: 6, name: 'Ceramide Repair Toner', brand: 'Dr. Jart+', price: 42.00, originalPrice: null, rating: 4.6, reviews: 318, image: "https://images.unsplash.com/photo-1616526629549-353331fea648", alt: 'Blue toner bottle with medical-inspired packaging on white background', badge: 'Staff Pick', badgeType: 'info', category: 'Serums', inStock: true, isNew: false, stock: 5 },
  { id: 7, name: 'Rice Water Brightener', brand: "I'm From", price: 31.00, originalPrice: 40.00, rating: 4.7, reviews: 567, image: "https://images.unsplash.com/photo-1595300398913-3772655443e1", alt: 'White essence bottle with rice grain design on warm cream background', badge: 'Trending', badgeType: 'rose', category: 'Moisturizers', inStock: true, isNew: false, stock: 19 },
  { id: 8, name: 'Centella Calming Gel', brand: 'Purito', price: 17.50, originalPrice: null, rating: 4.8, reviews: 789, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c6599022-1772541113609.png", alt: 'Green gel moisturizer tube with centella leaf illustration on white background', badge: null, badgeType: null, category: 'Moisturizers', inStock: false, isNew: false, stock: 0 },
  { id: 9, name: 'Eye Peptide Cream', brand: 'Sulwhasoo', price: 55.00, originalPrice: null, rating: 4.9, reviews: 234, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e4c966dd-1773435900095.png", alt: 'Luxury eye cream jar with gold lid on dark marble surface', badge: 'Premium', badgeType: 'accent', category: 'Eye Care', inStock: true, isNew: true, stock: 4 },
  { id: 10, name: 'Honey Clay Mask', brand: 'Heimish', price: 24.00, originalPrice: 30.00, rating: 4.6, reviews: 445, image: "https://images.unsplash.com/photo-1710693547884-41a6113d67d2", alt: 'Clay mask jar with honey-colored product on cream background', badge: '20% OFF', badgeType: 'sale', category: 'Masks', inStock: true, isNew: false, stock: 7 },
  { id: 11, name: 'Niacinamide 10% Serum', brand: 'The Ordinary', price: 11.90, originalPrice: null, rating: 4.5, reviews: 3201, image: "https://images.unsplash.com/photo-1728842942519-4b986f62ea62", alt: 'Minimalist serum bottle with clinical label on white background', badge: 'Budget Pick', badgeType: 'info', category: 'Serums', inStock: true, isNew: false, stock: 11 },
  { id: 12, name: 'Cica Recovery Cream', brand: 'Dr. G', price: 38.50, originalPrice: null, rating: 4.8, reviews: 612, image: "https://images.unsplash.com/photo-1707555647417-960972bb9d5f", alt: 'White recovery cream tube with green cica design on light background', badge: 'New', badgeType: 'accent', category: 'Moisturizers', inStock: true, isNew: true, stock: 23 },
];

const badgeStyles: Record<string, string> = {
  rose: 'bg-rose-light text-rose-deep border border-primary/40',
  accent: 'bg-accent/15 text-gold-deep border border-accent/30',
  sale: 'bg-red-50 text-red-600 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-accent' : 'text-border'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return null;
  if (stock <= 5) return (
    <div className="flex items-center gap-1 mt-1">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      <span className="text-[10px] font-bold text-red-600">Only {stock} left!</span>
    </div>
  );
  if (stock <= 10) return (
    <div className="flex items-center gap-1 mt-1">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      <span className="text-[10px] font-semibold text-amber-600">Low stock ({stock} left)</span>
    </div>
  );
  return null;
}

export default function ProductListingClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePriceRange, setActivePriceRange] = useState(0);
  const [activeSort, setActiveSort] = useState('Featured');
  const [cartAdded, setCartAdded] = useState<number[]>([]);
  const [stockWarning, setStockWarning] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeFilters = useMemo(() => {
    const f: string[] = [];
    if (activeCategory !== 'All') f.push(activeCategory);
    if (activePriceRange !== 0) f.push(priceRanges[activePriceRange].label);
    if (searchQuery) f.push(`"${searchQuery}"`);
    return f;
  }, [activeCategory, activePriceRange, searchQuery]);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (searchQuery) list = list.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeCategory !== 'All') list = list.filter((p) => p.category === activeCategory);
    const pr = priceRanges[activePriceRange];
    list = list.filter((p) => p.price >= pr.min && p.price <= pr.max);
    if (activeSort === 'Price: Low to High') list.sort((a, b) => a.price - b.price);
    else if (activeSort === 'Price: High to Low') list.sort((a, b) => b.price - a.price);
    else if (activeSort === 'Best Rated') list.sort((a, b) => b.rating - a.rating);
    else if (activeSort === 'Newest') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [searchQuery, activeCategory, activePriceRange, activeSort]);

  const handleAddToCart = useCallback((product: Product) => {
    if (!product.inStock || product.stock === 0) return;
    // Real-time inventory check
    if (product.stock <= 5) {
      setStockWarning(product.id);
      setTimeout(() => setStockWarning(null), 3000);
    }
    setCartAdded((prev) => [...prev, product.id]);
    setTimeout(() => setCartAdded((prev) => prev.filter((x) => x !== product.id)), 2000);
  }, []);

  const clearFilters = () => {
    setActiveCategory('All');
    setActivePriceRange(0);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Stock warning toast */}
      {stockWarning !== null && (
        <div className="fixed top-20 right-6 z-[200] bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 shadow-xl flex items-start gap-3 max-w-xs animate-in slide-in-from-right">
          <Icon name="ExclamationTriangleIcon" size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Low Stock Warning</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {allProducts.find(p => p.id === stockWarning)?.name} has only {allProducts.find(p => p.id === stockWarning)?.stock} units remaining. Order soon!
            </p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="bg-secondary/40 border-b border-border px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Products</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">All Products</h1>
          <p className="text-muted-foreground text-sm">{allProducts.length} premium skincare products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer min-h-[44px]"
            >
              {sortOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground min-h-[44px]"
            >
              <Icon name="FunnelIcon" size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground font-medium">Active:</span>
            {activeFilters.map((f) => (
              <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-foreground text-xs font-semibold rounded-xl border border-primary/30">
                {f}
                <button onClick={clearFilters} aria-label="Remove filter" className="hover:text-rose-deep transition-colors">
                  <Icon name="XMarkIcon" size={12} />
                </button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-rose-deep transition-colors underline">Clear all</button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden md:flex flex-col gap-6 w-56 shrink-0">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Category</h3>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${activeCategory === cat ? 'bg-primary/20 text-foreground font-semibold border border-primary/30' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Price Range</h3>
              <div className="flex flex-col gap-1">
                {priceRanges.map((pr, idx) => (
                  <button
                    key={pr.label}
                    onClick={() => setActivePriceRange(idx)}
                    className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${activePriceRange === idx ? 'bg-accent/15 text-gold-deep font-semibold border border-accent/30' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-[100] md:hidden">
              <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
              <div className="absolute top-0 left-0 bottom-0 w-72 bg-card p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-foreground">Filters</h3>
                  <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all">
                    <Icon name="XMarkIcon" size={20} />
                  </button>
                </div>
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Category</h4>
                  <div className="flex flex-col gap-1">
                    {categories.map((cat) => (
                      <button key={cat} onClick={() => { setActiveCategory(cat); setSidebarOpen(false); }}
                        className={`text-left px-3 py-3 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? 'bg-primary/20 text-foreground font-semibold' : 'text-muted-foreground hover:bg-secondary'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Price Range</h4>
                  <div className="flex flex-col gap-1">
                    {priceRanges.map((pr, idx) => (
                      <button key={pr.label} onClick={() => { setActivePriceRange(idx); setSidebarOpen(false); }}
                        className={`text-left px-3 py-3 rounded-xl text-sm font-medium transition-all ${activePriceRange === idx ? 'bg-accent/15 text-gold-deep font-semibold' : 'text-muted-foreground hover:bg-secondary'}`}>
                        {pr.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{filtered.length}</span> results
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Icon name="MagnifyingGlassIcon" size={40} className="text-border mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm mb-5">Try adjusting your filters or search query.</p>
                <button onClick={clearFilters} className="px-5 py-2.5 bg-primary text-foreground font-semibold rounded-xl text-sm hover:bg-rose-deep hover:text-white transition-all">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product, i) => (
                  <div
                    key={product.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-rose transition-all duration-300 hover:-translate-y-1 group flex flex-col"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <AppImage
                        src={product.image}
                        alt={product.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.badge && (
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${badgeStyles[product.badgeType!]}`}>
                          {product.badge}
                        </span>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                          <span className="bg-card px-3 py-1.5 rounded-lg text-xs font-bold text-foreground">Out of Stock</span>
                        </div>
                      )}
                      <button aria-label="Add to wishlist" className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary">
                        <Icon name="HeartIcon" size={14} className="text-muted-foreground" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">{product.brand}</p>
                      <h3 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={product.rating} />
                        <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews.toLocaleString()})</span>
                      </div>
                      {/* Stock indicator */}
                      <StockBadge stock={product.stock} />
                      <div className="flex items-baseline gap-2 mt-auto mb-3 pt-2">
                        <span className="text-lg font-extrabold text-foreground">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => product.inStock && handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                          !product.inStock
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : cartAdded.includes(product.id)
                            ? 'bg-green-500 text-white' :'bg-primary text-foreground hover:bg-rose-deep hover:text-white shadow-rose'
                        }`}
                      >
                        {cartAdded.includes(product.id) ? (
                          <><Icon name="CheckIcon" size={15} /> Added!</>
                        ) : (
                          <><Icon name="ShoppingBagIcon" size={15} /> Add to Cart</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}