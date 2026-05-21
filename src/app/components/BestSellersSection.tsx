'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';
import { useShowcaseProducts } from '@/hooks/useShowcaseProducts';
import type { CatalogProduct } from '@/lib/mock/productCatalog';
import { isStaticShowcaseId } from '@/lib/catalog/showcaseStatic';

const filterTabs = ['All', 'Moisturizers', 'Serums', 'Cleansers', 'Sunscreen'];

const badgeStyles: Record<string, string> = {
  rose: 'bg-rose-light text-rose-deep border border-primary/40',
  accent: 'bg-accent/15 text-gold-deep border border-accent/30',
  sale: 'bg-red-50 text-red-600 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-accent' : 'text-border'}`}
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

export default function BestSellersSection() {
  const router = useRouter();
  const { addItem } = useCart();
  const { products: showcaseProducts, loading, error, apiConnected } = useShowcaseProducts();

  const [activeFilter, setActiveFilter] = useState('All');
  const [cartAdded, setCartAdded] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return showcaseProducts;
    const tab = activeFilter.toLowerCase();
    return showcaseProducts.filter((p) => p.category.toLowerCase() === tab);
  }, [activeFilter, showcaseProducts]);

  const handleAddToCart = (product: CatalogProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock || product.stock === 0 || isStaticShowcaseId(product.id)) return;
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
  };

  return (
    <section className="py-16 md:py-20 px-6 bg-secondary/40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="scroll-animate">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent block mb-2">
              Most Loved
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
              Best Sellers
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 scroll-animate delay-200">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                  activeFilter === tab
                    ? 'bg-primary text-foreground shadow-rose'
                    : 'bg-card text-muted-foreground hover:bg-secondary border border-border hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {error && !apiConnected && (
          <p className="text-sm text-amber-800 mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            Live catalog unavailable ({error}). Showing preview products — start the API at{' '}
            <code className="text-xs">http://localhost:8080</code> (see{' '}
            <code className="text-xs">NEXT_PUBLIC_API_URL</code> in <code className="text-xs">.env</code>) for
            cart and product pages.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading && filtered.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl overflow-hidden shadow-card border border-border animate-pulse"
                >
                  <div className="h-52 bg-secondary" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-secondary rounded w-1/3" />
                    <div className="h-4 bg-secondary rounded w-5/6" />
                    <div className="h-8 bg-secondary rounded w-full mt-6" />
                  </div>
                </div>
              ))
            : filtered.map((product, i) => (
                <Link
                  key={`${activeFilter}-${product.sku}`}
                  href={
                    isStaticShowcaseId(product.id)
                      ? '/product-listing'
                      : `/product-detail/${product.id}`
                  }
                  className="scroll-animate bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-rose transition-all duration-300 hover:-translate-y-1 group flex flex-col"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="relative h-52 overflow-hidden shimmer-wrapper">
                    <AppImage
                      src={product.image}
                      alt={product.alt}
                      fill
                      priority={i < 4}
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {product.badge && product.badgeType && (
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${badgeStyles[product.badgeType]}`}
                      >
                        {product.badge}
                      </span>
                    )}

                    {!product.inStock && (
                      <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                        <span className="bg-card px-3 py-1.5 rounded-lg text-xs font-bold text-foreground">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      aria-label="Add to wishlist"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary"
                    >
                      <Icon name="HeartIcon" size={14} className="text-muted-foreground" />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">
                      {product.brand}
                    </p>
                    <h3 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={product.rating} />
                      <span className="text-xs text-muted-foreground">
                        {product.rating} ({product.reviews.toLocaleString()})
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-auto mb-3">
                      <span className="text-lg font-extrabold text-foreground">
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
                      disabled={!product.inStock || isStaticShowcaseId(product.id)}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                        !product.inStock
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : cartAdded.includes(product.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-primary text-foreground hover:bg-rose-deep hover:text-white shadow-rose'
                      }`}
                    >
                      {cartAdded.includes(product.id) ? (
                        <>
                          <Icon name="CheckIcon" size={15} />
                          Added!
                        </>
                      ) : (
                        <>
                          <Icon name="ShoppingBagIcon" size={15} />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              ))}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">
            No products match this filter. Try another category or view all products.
          </p>
        )}

        <div className="text-center mt-10 scroll-animate">
          <button
            type="button"
            onClick={() => router.push('/product-listing')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-foreground text-background font-bold rounded-2xl hover:bg-accent transition-all text-sm shadow-soft min-h-[44px]"
          >
            View All Products
            <Icon name="ArrowRightIcon" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
