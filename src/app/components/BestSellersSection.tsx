'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const filterTabs = ['All', 'Moisturizers', 'Serums', 'Cleansers', 'Sunscreen'];

const products = [
{
  id: 1,
  name: 'Glow Essence Serum',
  brand: 'COSRX',
  price: 28.99,
  originalPrice: 38.99,
  rating: 4.9,
  reviews: 1247,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_14ffa882d-1773310521963.png",
  alt: 'Clear glass serum bottle with white dropper cap on soft pink background',
  badge: 'Best Seller',
  badgeType: 'rose',
  category: 'Serums',
  inStock: true
},
{
  id: 2,
  name: 'Hydra Barrier Cream',
  brand: 'Laneige',
  price: 34.00,
  originalPrice: null,
  rating: 4.8,
  reviews: 893,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e9fd727b-1772071563202.png",
  alt: 'White cream jar with minimalist label on marble surface with soft shadows',
  badge: 'New',
  badgeType: 'accent',
  category: 'Moisturizers',
  inStock: true
},
{
  id: 3,
  name: 'Snail Mucin Essence',
  brand: 'COSRX',
  price: 22.50,
  originalPrice: 29.00,
  rating: 4.9,
  reviews: 2103,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_10ac1dfcb-1772216203794.png",
  alt: 'Translucent essence bottle with minimalist Korean label on clean white background',
  badge: '22% OFF',
  badgeType: 'sale',
  category: 'Serums',
  inStock: true
},
{
  id: 4,
  name: 'Gentle Foam Cleanser',
  brand: 'Innisfree',
  price: 15.99,
  originalPrice: null,
  rating: 4.7,
  reviews: 654,
  image: "https://images.unsplash.com/photo-1695561115616-b4b719f1a242",
  alt: 'Green foam cleanser tube with botanical design on light beige background',
  badge: null,
  badgeType: null,
  category: 'Cleansers',
  inStock: true
},
{
  id: 5,
  name: 'UV Shield SPF 50+',
  brand: 'Skin1004',
  price: 19.99,
  originalPrice: 24.99,
  rating: 4.8,
  reviews: 421,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_121d6c73f-1772074800330.png",
  alt: 'White sunscreen tube with minimal packaging on light cream background',
  badge: '20% OFF',
  badgeType: 'sale',
  category: 'Sunscreen',
  inStock: true
},
{
  id: 6,
  name: 'Ceramide Repair Toner',
  brand: 'Dr. Jart+',
  price: 42.00,
  originalPrice: null,
  rating: 4.6,
  reviews: 318,
  image: "https://images.unsplash.com/photo-1616526629549-353331fea648",
  alt: 'Blue toner bottle with medical-inspired packaging on white background',
  badge: 'Staff Pick',
  badgeType: 'info',
  category: 'Serums',
  inStock: true
},
{
  id: 7,
  name: 'Rice Water Brightener',
  brand: 'I\'m From',
  price: 31.00,
  originalPrice: 40.00,
  rating: 4.7,
  reviews: 567,
  image: "https://images.unsplash.com/photo-1595300398913-3772655443e1",
  alt: 'White essence bottle with rice grain design on warm cream background',
  badge: 'Trending',
  badgeType: 'rose',
  category: 'Moisturizers',
  inStock: true
},
{
  id: 8,
  name: 'Centella Calming Gel',
  brand: 'Purito',
  price: 17.50,
  originalPrice: null,
  rating: 4.8,
  reviews: 789,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c6599022-1772541113609.png",
  alt: 'Green gel moisturizer tube with centella leaf illustration on white background',
  badge: null,
  badgeType: null,
  category: 'Moisturizers',
  inStock: false
}];


const badgeStyles: Record<string, string> = {
  rose: 'bg-rose-light text-rose-deep border border-primary/40',
  accent: 'bg-accent/15 text-gold-deep border border-accent/30',
  sale: 'bg-red-50 text-red-600 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200'
};

function StarRating({ rating }: {rating: number;}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) =>
      <svg
        key={star}
        className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-accent' : 'text-border'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden>
        
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
    </div>);

}

export default function BestSellersSection() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [cartAdded, setCartAdded] = useState<number[]>([]);
  const router = useRouter();

  const filtered = activeFilter === 'All' ?
  products :
  products.filter((p) => p.category === activeFilter);

  const handleAddToCart = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCartAdded((prev) => [...prev, id]);
    setTimeout(() => setCartAdded((prev) => prev.filter((x) => x !== id)), 2000);
  };

  return (
    <section className="py-16 md:py-20 px-6 bg-secondary/40">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="scroll-animate">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent block mb-2">
              Most Loved
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
              Best Sellers
            </h2>
          </div>

          {/* Filter tabs — category filters stay as-is (no login redirect) */}
          <div className="flex flex-wrap gap-2 scroll-animate delay-200">
            {filterTabs.map((tab) =>
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
              activeFilter === tab ?
              'bg-primary text-foreground shadow-rose' :
              'bg-card text-muted-foreground hover:bg-secondary border border-border hover:text-foreground'}`
              }>
              
                {tab}
              </button>
            )}
          </div>
        </div>

        {/* Product grid — 4 cols desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((product, i) =>
          <Link
            key={product.id}
            href={`/product-detail/${product.id}`}
            className="scroll-animate bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-rose transition-all duration-300 hover:-translate-y-1 group flex flex-col"
            style={{ transitionDelay: `${i * 60}ms` }}>
            
              {/* Image */}
              <div className="relative h-52 overflow-hidden shimmer-wrapper">
                <AppImage
                src={product.image}
                alt={product.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500" />
              

                {/* Badge */}
                {product.badge &&
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${badgeStyles[product.badgeType!]}`}>
                    {product.badge}
                  </span>
              }

                {/* Out of stock overlay */}
                {!product.inStock &&
              <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                    <span className="bg-card px-3 py-1.5 rounded-lg text-xs font-bold text-foreground">
                      Out of Stock
                    </span>
                  </div>
              }

                {/* Wishlist */}
                <button
                aria-label="Add to wishlist"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary">
                
                  <Icon name="HeartIcon" size={14} className="text-muted-foreground" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">{product.brand}</p>
                <h3 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-muted-foreground">
                    {product.rating} ({product.reviews.toLocaleString()})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-auto mb-3">
                  <span className="text-lg font-extrabold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice &&
                <span className="text-xs text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                }
                </div>

                {/* Add to cart */}
                <button
                onClick={(e) => product.inStock && handleAddToCart(product.id, e)}
                disabled={!product.inStock}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                !product.inStock ?
                'bg-muted text-muted-foreground cursor-not-allowed' :
                cartAdded.includes(product.id) ?
                'bg-green-500 text-white' : 'bg-primary text-foreground hover:bg-rose-deep hover:text-white shadow-rose'}`
                }>
                
                  {cartAdded.includes(product.id) ?
                <>
                      <Icon name="CheckIcon" size={15} />
                      Added!
                    </> :

                <>
                      <Icon name="ShoppingBagIcon" size={15} />
                      Add to Cart
                    </>
                }
                </button>
              </div>
            </Link>
          )}
        </div>

        {/* View all */}
        <div className="text-center mt-10 scroll-animate">
          <button
            onClick={() => router.push('/product-listing')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-foreground text-background font-bold rounded-2xl hover:bg-accent transition-all text-sm shadow-soft min-h-[44px]">
            
            View All Products
            <Icon name="ArrowRightIcon" size={16} />
          </button>
        </div>
      </div>
    </section>);

}