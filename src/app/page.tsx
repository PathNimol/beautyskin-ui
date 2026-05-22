import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import CategoriesSection from '@/app/components/CategoriesSection';
import BeautyGallerySection from '@/app/components/BeautyGallerySection';
import BestSellersSection from '@/app/components/BestSellersSection';
import PromotionBanner from '@/app/components/PromotionBanner';
import ReviewsSection from '@/app/components/ReviewsSection';
import ScrollAnimationInit from '@/app/components/ScrollAnimationInit';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden" data-page-content>
      <ScrollAnimationInit />

      <Header />
      <HeroSection />
      <CategoriesSection />
      <BeautyGallerySection />
      <BestSellersSection />
      <PromotionBanner />
      <ReviewsSection />
      <Footer />
    </main>
  );
}