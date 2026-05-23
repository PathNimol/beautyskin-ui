'use client';

import AppImage from '@/components/ui/AppImage';
import { beautyGallery } from '@/lib/media/beautyImages';

export default function BeautyGallerySection() {
  return (
    <section className="py-14 md:py-20 px-6 bg-background border-y border-border/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 scroll-animate">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent block mb-2">
            Inspiration
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
            The Beauty Skin Ritual
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Clean formulas, soft textures, and everyday moments of self-care — curated from our community.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {beautyGallery.map((item, i) => (
            <div
              key={item.src}
              className={`relative rounded-2xl overflow-hidden scroll-animate bg-secondary ${
                i === 0 ? 'md:col-span-2 md:row-span-2 aspect-[4/5] md:aspect-auto md:min-h-[320px]' : 'aspect-square'
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <AppImage
                src={item.src}
                alt={item.alt}
                fill
                unoptimized
                sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
