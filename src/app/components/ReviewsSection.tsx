import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { beautyPortraits } from '@/lib/media/beautyImages';

const reviews = [
{
  id: 1,
  name: 'Mia Johnson',
  role: 'Verified Buyer',
  avatar: beautyPortraits.mia,
  avatarAlt: 'Young woman with warm smile, natural lighting, casual style',
  rating: 5,
  text: "The Glow Essence Serum completely transformed my skin. After just 2 weeks, my hyperpigmentation faded and I finally have that glass-skin look I've been chasing. 100% repurchasing.",
  product: 'Glow Essence Serum',
  date: 'May 8, 2026',
  verified: true
},
{
  id: 2,
  name: 'Sophia Chen',
  role: 'Skincare Enthusiast',
  avatar: beautyPortraits.sophia,
  avatarAlt: 'Asian woman with clear skin and bright eyes, soft background',
  rating: 5,
  text: "I\'ve tried every Korean skincare brand out there. BS Online Shop has the most authentic selection and the fastest shipping. The Snail Mucin Essence is my holy grail — nothing compares.",
  product: 'Snail Mucin Essence',
  date: 'May 3, 2026',
  verified: true
},
{
  id: 3,
  name: 'Aisha Patel',
  role: 'Beauty Blogger',
  avatar: beautyPortraits.aisha,
  avatarAlt: 'South Asian woman with confident expression, bright airy studio',
  rating: 5,
  text: "As a beauty blogger I review hundreds of products. BS Online Shop stands out for their curation — every product is carefully selected. The Ceramide Repair Toner saved my compromised skin barrier.",
  product: 'Ceramide Repair Toner',
  date: 'Apr 27, 2026',
  verified: true
}];


function StarRating({ rating }: {rating: number;}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) =>
      <svg
        key={s}
        className={`w-4 h-4 ${s <= rating ? 'text-accent' : 'text-border'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden>
        
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
    </div>);

}

export default function ReviewsSection() {
  return (
    <section className="py-16 md:py-20 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 scroll-animate">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent block mb-2">
            Real Results
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight mb-3">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            Over 3,200 verified reviews from real skincare lovers.
          </p>

          {/* Overall rating */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) =>
              <svg key={s} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
            <span className="text-2xl font-extrabold text-foreground">4.9</span>
            <span className="text-muted-foreground text-sm">out of 5 · 3,247 reviews</span>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) =>
          <div
            key={review.id}
            className="scroll-animate bg-card rounded-2xl p-6 shadow-card hover:shadow-rose transition-all duration-300 hover:-translate-y-1 flex flex-col"
            style={{ transitionDelay: `${i * 100}ms` }}>
            
              {/* Quote icon */}
              <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Icon name="ChatBubbleLeftEllipsisIcon" size={16} className="text-rose-deep" />
              </div>

              {/* Stars */}
              <StarRating rating={review.rating} />

              {/* Text */}
              <p className="text-sm text-foreground/80 leading-relaxed mt-3 mb-5 flex-1">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Product tag */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                <Icon name="TagIcon" size={12} className="text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{review.product}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
                  <AppImage
                  src={review.avatar}
                  alt={review.avatarAlt}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full" />
                
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-foreground">{review.name}</p>
                    {review.verified &&
                  <Icon name="CheckBadgeIcon" size={14} className="text-green-500" />
                  }
                  </div>
                  <p className="text-[10px] text-muted-foreground">{review.role} · {review.date}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}