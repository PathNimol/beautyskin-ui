'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const heroStats = [
{ value: '3.2K+', label: 'Happy Customers' },
{ value: '150+', label: 'Products' },
{ value: '4.9★', label: 'Avg. Rating' }];


export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col justify-end pb-16 md:pb-28">
      {/* Cinematic background image */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src="https://images.unsplash.com/photo-1702312685548-3832748d09d6"
          alt="Flat lay of premium skincare products on cream marble surface with soft natural lighting and botanical accents"
          fill
          priority
          sizes="100vw"
          className={`object-cover transition-all duration-[3500ms] ease-out ${
          loaded ? 'scale-100 blur-0 grayscale-0 opacity-100' : 'scale-110 blur-xl grayscale opacity-0'}`
          } />
        
        {/* Gradient scrim — bottom heavy for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-transparent" />
        {/* Warm rose tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
      </div>
      {/* Scan line effect */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="hero-scan w-full h-40 absolute top-0 opacity-40" />
      </div>
      {/* Floating badge — top right */}
      <div
        className={`absolute top-28 right-6 md:right-16 z-20 transition-all duration-700 ${
        loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`
        }
        style={{ transitionDelay: '2200ms' }}>
        
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 shadow-rose">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-foreground tracking-wide">New Arrivals Live</span>
        </div>
      </div>
      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        {/* Left: Headline */}
        <div className="md:col-span-7">
          {/* Eyebrow */}
          <div
            className={`flex items-center gap-3 mb-5 transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
            }
            style={{ transitionDelay: '1200ms' }}>
            
            <span className="h-px w-8 bg-primary/80" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/90">
              Beauty Skin — Est. 2024
            </span>
          </div>

          {/* Main headline */}
          <h1
            className={`text-hero-xl font-extrabold text-white leading-tight tracking-tight mb-6 transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`
            }
            style={{ transitionDelay: '1400ms' }}>
            
            Glow Starts
            <br />
            <span className="text-primary">Here.</span>
          </h1>

          {/* Sub */}
          <p
            className={`text-base md:text-lg text-white/75 max-w-md leading-relaxed mb-8 font-medium transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
            }
            style={{ transitionDelay: '1600ms' }}>
            
            Premium Korean-inspired skincare rituals — crafted for every skin type, delivered to your door.
          </p>

          {/* CTAs — navigate to login */}
          <div
            className={`flex flex-wrap gap-4 transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
            }
            style={{ transitionDelay: '1800ms' }}>
            
            <button
              onClick={() => router?.push('/login')}
              className="flex items-center gap-2 px-7 py-3.5 bg-primary text-foreground font-bold rounded-2xl hover:bg-rose-deep hover:text-white transition-all shadow-rose text-sm">
              
              Shop Now
              <Icon name="ArrowRightIcon" size={16} />
            </button>
            <button
              onClick={() => router?.push('/login')}
              className="flex items-center gap-2 px-7 py-3.5 glass-card text-white font-semibold rounded-2xl hover:bg-white/20 transition-all text-sm border border-white/30">
              
              View Collections
            </button>
          </div>
        </div>

        {/* Right: Glass stats card */}
        <div
          className={`md:col-span-4 md:col-start-9 transition-all duration-700 ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`
          }
          style={{ transitionDelay: '2000ms' }}>
          
          <div className="glass-card rounded-2xl p-6 shadow-rose relative overflow-hidden">
            {/* Shimmer */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-shimmer-card" />

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-5">
              Our Numbers
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {heroStats?.map((stat) =>
              <div key={stat?.label} className="text-center">
                  <p className="text-xl font-extrabold text-foreground">{stat?.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat?.label}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => router?.push('/login')}
              className="flex items-center justify-between w-full border-t border-border/60 pt-4 group">
              
              <span className="text-sm font-semibold text-foreground">Explore Bestsellers</span>
              <Icon
                name="ArrowRightIcon"
                size={16}
                className="text-accent group-hover:translate-x-1 transition-transform" />
              
            </button>
          </div>
        </div>
      </div>
      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 ${
        loaded ? 'opacity-100' : 'opacity-0'}`
        }
        style={{ transitionDelay: '2400ms' }}>
        
        <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
      </div>
    </section>
  );

}