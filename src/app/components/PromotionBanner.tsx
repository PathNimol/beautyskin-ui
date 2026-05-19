'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(targetHours: number): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date();
    target.setHours(target.getHours() + targetHours);

    const tick = () => {
      const now = new Date().getTime();
      const diff = target.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor(diff % (1000 * 60 * 60) / (1000 * 60)),
        seconds: Math.floor(diff % (1000 * 60) / 1000)
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetHours]);

  return timeLeft;
}

function TimeUnit({ value, label }: {value: number;label: string;}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 bg-foreground/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
        <span className="text-2xl font-extrabold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-white/60 mt-1.5 font-semibold">{label}</span>
    </div>);

}

export default function PromotionBanner() {
  const timeLeft = useCountdown(12);
  const router = useRouter();

  return (
    <section className="py-16 md:py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto scroll-animate">
        <div className="relative rounded-3xl overflow-hidden min-h-[320px] flex items-center">
          {/* Background image — dark scene for white text */}
          <AppImage
            src="https://images.unsplash.com/photo-1551562641-9998f16c6bff"
            alt="Luxurious skincare product arrangement on dark moody background with deep shadows, dramatic low-key lighting, dark velvet surface"
            fill
            sizes="100vw"
            className="object-cover" />
          

          {/* Dark scrim for white text */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />

          {/* Decorative rose circle */}
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute right-20 bottom-0 w-64 h-64 rounded-full bg-accent/15 blur-2xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 w-full px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 border border-accent/40 rounded-full mb-5">
                <Icon name="SparklesIcon" size={13} className="text-accent" />
                <span className="text-xs font-bold uppercase tracking-widest text-accent">Flash Sale</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
                Up to <span className="text-primary">30% Off</span>
                <br />
                Bestsellers
              </h2>

              <p className="text-base text-white/70 leading-relaxed mb-6 max-w-sm font-medium">
                Limited time offer on our most-loved Korean skincare essentials. Use code{' '}
                <span className="font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-lg">GLOW30</span>
              </p>

              <button
                onClick={() => router.push('/product-listing')}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-foreground font-bold rounded-2xl hover:bg-white transition-all shadow-rose text-sm min-h-[44px]">
                
                Shop the Sale
                <Icon name="ArrowRightIcon" size={16} />
              </button>
            </div>

            {/* Right: Countdown */}
            <div className="flex flex-col items-start md:items-end gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4 md:text-right">
                  Offer ends in
                </p>
                <div className="flex items-end gap-3">
                  <TimeUnit value={timeLeft.hours} label="Hours" />
                  <span className="text-2xl font-extrabold text-white/60 mb-6">:</span>
                  <TimeUnit value={timeLeft.minutes} label="Mins" />
                  <span className="text-2xl font-extrabold text-white/60 mb-6">:</span>
                  <TimeUnit value={timeLeft.seconds} label="Secs" />
                </div>
              </div>

              {/* Promo stats */}
              <div className="flex items-center gap-6 border-t border-white/10 pt-6 w-full md:justify-end">
                <div className="text-center">
                  <p className="text-xl font-extrabold text-white">500+</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Items on sale</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-xl font-extrabold text-white">Free</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Shipping $50+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}