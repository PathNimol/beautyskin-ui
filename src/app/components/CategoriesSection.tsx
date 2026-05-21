import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { beautyCategories } from '@/lib/media/beautyImages';

/**
 * BENTO GRID AUDIT — 6 cards
 * Cards: [Moisturizers, Serums, Cleansers, Sunscreen, Eye Care, Masks]
 *
 * Desktop grid-cols-4:
 * Row 1: [col-1+2: Moisturizers cs-2 rs-2] [col-3: Serums cs-1] [col-4: Cleansers cs-1]
 * Row 2: [col-1+2: FILLED-Moisturizers]    [col-3: Sunscreen]   [col-4: Eye Care]
 * Row 3: [col-1+2+3+4: Masks cs-4]
 *
 * Placed 6/6 cards ✓
 */

const categories = [
{
  id: 1,
  name: 'Moisturizers',
  desc: 'Deep hydration for every skin type',
  count: '32 products',
  image: beautyCategories.moisturizers,
  alt: 'Cream moisturizer jar with white lid on marble surface, soft natural lighting',
  span: 'md:col-span-2 md:row-span-2',
  textSize: 'text-2xl md:text-3xl',
  height: 'h-72 md:h-full',
  bgFrom: 'from-primary/60'
},
{
  id: 2,
  name: 'Serums',
  desc: 'Targeted treatments',
  count: '24 products',
  image: beautyCategories.serums,
  alt: 'Glass dropper serum bottle with golden cap on light pink background',
  span: 'md:col-span-1',
  textSize: 'text-xl',
  height: 'h-52',
  bgFrom: 'from-accent/50'
},
{
  id: 3,
  name: 'Cleansers',
  desc: 'Gentle daily care',
  count: '18 products',
  image: beautyCategories.cleansers,
  alt: 'White foam cleanser tube on light beige background with botanical leaves',
  span: 'md:col-span-1',
  textSize: 'text-xl',
  height: 'h-52',
  bgFrom: 'from-secondary/80'
},
{
  id: 4,
  name: 'Sunscreen',
  desc: 'SPF protection',
  count: '12 products',
  image: beautyCategories.sunscreen,
  alt: 'White sunscreen tube with pastel yellow packaging on cream background',
  span: 'md:col-span-1',
  textSize: 'text-xl',
  height: 'h-52',
  bgFrom: 'from-amber-200/60'
},
{
  id: 5,
  name: 'Eye Care',
  desc: 'Under-eye solutions',
  count: '10 products',
  image: beautyCategories.eyeCare,
  alt: 'Small eye cream jar with silver lid on white marble surface, minimal styling',
  span: 'md:col-span-1',
  textSize: 'text-xl',
  height: 'h-52',
  bgFrom: 'from-rose-light/70'
},
{
  id: 6,
  name: 'Masks & Treatments',
  desc: 'Weekly ritual boosters for radiant, glass skin',
  count: '20 products',
  image: beautyCategories.masks,
  alt: 'Sheet mask and clay mask products arranged on cream background with pink flower petals',
  span: 'md:col-span-4',
  textSize: 'text-2xl md:text-4xl',
  height: 'h-48',
  bgFrom: 'from-foreground/60',
  wide: true
}];


export default function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 scroll-animate">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent block mb-2">
              Shop by Category
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
              Find Your
              <span className="text-primary"> Ritual.</span>
            </h2>
          </div>
          {/* "All Categories" link → login */}
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-gold-deep transition-colors group self-start md:self-auto">
            
            All Categories
            <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Bento Grid — category cards keep their product-listing href */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[600px]">
          {categories?.map((cat, i) =>
          <Link
            key={cat?.id}
            href="/product-listing"
            className={`relative rounded-2xl overflow-hidden group cursor-pointer scroll-animate ${cat?.span} ${cat?.height}`}
            style={{ transitionDelay: `${i * 80}ms` }}>
            
              {/* Image */}
              <AppImage
              src={cat?.image}
              alt={cat?.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-700" />
            

              {/* Gradient scrim — text is white, needs dark overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat?.bgFrom} via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity`} />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70 mb-1">
                  {cat?.count}
                </p>
                <h3 className={`${cat?.textSize} font-extrabold text-white leading-tight tracking-tight`}>
                  {cat?.name}
                </h3>
                {cat?.wide &&
              <p className="text-sm text-white/70 mt-1 font-medium">{cat?.desc}</p>
              }
                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span className="text-xs font-semibold text-white/90">Shop now</span>
                  <span className="text-white/80 text-sm">→</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>);

}