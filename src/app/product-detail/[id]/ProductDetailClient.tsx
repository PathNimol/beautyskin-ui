'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { MOCK_REVIEWS } from '@/lib/mock/data';
import type { Product, Review } from '@/lib/mock/data';
import { getProduct, listCatalog } from '@/lib/api/services/products';
import { mapApiProductToMock } from '@/lib/api/mappers';
import type { ApiProduct } from '@/lib/api/types';
import { useCart } from '@/contexts/CartContext';

interface ReviewFormData {
  rating: number;
  title: string;
  body: string;
  skinType: string;
  photoPreview: string | null;
}

export default function ProductDetailClient({ productId }: { productId: string }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'howto' | 'reviews'>('description');
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 5,
    title: '',
    body: '',
    skinType: '',
    photoPreview: null,
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [localReviews, setLocalReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const apiProduct = await getProduct(productId);
        if (cancelled) return;
        const mapped = mapApiProductToMock(apiProduct);
        setProduct(mapped);
        setSelectedImage(0);
        setQuantity(1);
        setLocalReviews(MOCK_REVIEWS.filter((r) => r.productId === mapped.id));

        const relatedPage = await listCatalog({
          category: apiProduct.category,
          limit: 24,
          page: 1,
        });
        if (cancelled) return;
        const related = relatedPage.content
          .filter((p: ApiProduct) => p.id !== apiProduct.id)
          .slice(0, 4)
          .map((p: ApiProduct) => mapApiProductToMock(p));
        setRelatedProducts(related);
      } catch {
        if (!cancelled) {
          setProduct(null);
          setRelatedProducts([]);
          setLoadError('Could not load this product from the API.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      alt: product.imageAlt,
      shopId: product.shopId,
      shopName: product.shopName || 'Shop',
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setReviewForm((prev) => ({ ...prev, photoPreview: ev.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const newReview = {
      id: `rev-new-${Date.now()}`,
      productId: product.id,
      customerId: 'usr-005',
      customerName: 'Emma Rodriguez',
      customerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bdb060e2-1778572113176.png",
      customerAvatarAlt: 'Customer Emma Rodriguez',
      rating: reviewForm.rating,
      title: reviewForm.title,
      body: reviewForm.body,
      photos: reviewForm.photoPreview ? [reviewForm.photoPreview] : [],
      verified: true,
      helpful: 0,
      createdAt: 'Just now',
      skinType: reviewForm.skinType
    };
    setLocalReviews((prev) => [newReview as Review, ...prev]);
    setReviewSubmitted(true);
    setShowReviewForm(false);
    setReviewForm({ rating: 5, title: '', body: '', skinType: '', photoPreview: null });
    setTimeout(() => setReviewSubmitted(false), 4000);
    setActiveTab('reviews');
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm">
        Loading product…
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-foreground font-semibold mb-2">{loadError ?? 'Product not found'}</p>
        <Link href="/product-listing" className="text-accent font-bold hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  const avgRating =
    localReviews.length > 0
      ? localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length
      : product.rating;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: localReviews.filter((r) => r.rating === star).length,
    percent:
      localReviews.length > 0
        ? (localReviews.filter((r) => r.rating === star).length / localReviews.length) * 100
        : 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Icon name="ChevronRightIcon" size={12} />
          <Link href="/product-listing" className="hover:text-foreground transition-colors">Products</Link>
          <Icon name="ChevronRightIcon" size={12} />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-secondary">
              <AppImage
                src={product.images[selectedImage]?.src || product.image}
                alt={product.images[selectedImage]?.alt || product.imageAlt}
                width={600}
                height={600}
                className="object-cover w-full h-full" />
              
              {product.originalPrice &&
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  -{Math.round((product.originalPrice - product.price) / product.originalPrice * 100)}%
                </div>
              }
              <div className="absolute top-4 right-4">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                product.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                product.status === 'low_stock' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                product.status === 'out_of_stock' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`
                }>
                  {product.status === 'active' ? 'In Stock' :
                  product.status === 'low_stock' ? `Only ${product.stock} left` :
                  product.status === 'out_of_stock' ? 'Out of Stock' : 'Expiring Soon'}
                </span>
              </div>
            </div>
            {product.images.length > 1 &&
            <div className="flex gap-3">
                {product.images.map((img, i) =>
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary' : 'border-border hover:border-primary/50'}`}>
                
                    <AppImage src={img.src} alt={img.alt} width={80} height={80} className="object-cover w-full h-full" />
                  </button>
              )}
              </div>
            }
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2">{product.brand} · {product.category}</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) =>
                  <Icon key={star} name="StarIcon" size={16} className={star <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'} />
                  )}
                </div>
                <span className="text-sm font-bold text-foreground">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({localReviews.length} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-foreground">${product.price.toFixed(2)}</span>
              {product.originalPrice &&
              <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              }
            </div>

            {/* Skin Types */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Skin Type</p>
              <div className="flex flex-wrap gap-2">
                {product.skinType.map((type) =>
                <span key={type} className="px-3 py-1 bg-secondary border border-border rounded-full text-xs font-semibold text-foreground">
                    {type}
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) =>
              <span key={tag} className="px-2.5 py-1 bg-primary/10 text-rose-deep rounded-full text-[10px] font-bold uppercase tracking-wide">
                  #{tag}
                </span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-all">
                      
                      <Icon name="MinusIcon" size={14} className="text-foreground" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                      disabled={product.stock === 0}
                      className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-all disabled:opacity-40">
                      
                      <Icon name="PlusIcon" size={14} className="text-foreground" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">{product.stock} units available</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  addedToCart ?
                  'bg-green-500 text-white' :
                  product.stock === 0 ?
                  'bg-secondary text-muted-foreground cursor-not-allowed' :
                  'bg-primary text-foreground hover:bg-rose-deep hover:text-white shadow-rose'}`
                  }>
                  
                  <Icon name={addedToCart ? 'CheckIcon' : 'ShoppingCartIcon'} size={16} />
                  {addedToCart ? 'Added to Cart!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button className="w-12 h-12 border border-border rounded-xl flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-all">
                  <Icon name="HeartIcon" size={18} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              {[
              { label: 'SKU', value: product.sku },
              { label: 'Weight', value: product.weight },
              { label: 'Origin', value: product.origin },
              { label: 'Expiry', value: product.expiryDate }].
              map((item) =>
              <div key={item.label}>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{item.value}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-1 bg-secondary rounded-2xl p-1.5 mb-6 overflow-x-auto">
            {[
            { id: 'description', label: 'Description' },
            { id: 'ingredients', label: 'Ingredients' },
            { id: 'howto', label: 'How to Use' },
            { id: 'reviews', label: `Reviews (${localReviews.length})` }].
            map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'}`
              }>
              
                {tab.label}
              </button>
            )}
          </div>

          {activeTab === 'description' &&
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          }

          {activeTab === 'ingredients' &&
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h3 className="text-sm font-bold text-foreground mb-4">Key Ingredients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.ingredients.map((ingredient, i) =>
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-rose-deep">{i + 1}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{ingredient}</span>
                  </div>
              )}
              </div>
            </div>
          }

          {activeTab === 'howto' &&
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h3 className="text-sm font-bold text-foreground mb-4">How to Use</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.howToUse}</p>
            </div>
          }

          {activeTab === 'reviews' &&
          <div className="space-y-6">
              {/* Review Success */}
              {reviewSubmitted &&
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <Icon name="CheckCircleIcon" size={18} className="text-green-600 shrink-0" />
                  <p className="text-sm text-green-700 font-semibold">Your review has been submitted successfully!</p>
                </div>
            }

              {/* Rating Summary */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="text-center md:w-40 shrink-0">
                    <p className="text-5xl font-extrabold text-foreground">{avgRating.toFixed(1)}</p>
                    <div className="flex items-center justify-center gap-1 my-2">
                      {[1, 2, 3, 4, 5].map((star) =>
                    <Icon key={star} name="StarIcon" size={16} className={star <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'} />
                    )}
                    </div>
                    <p className="text-xs text-muted-foreground">{localReviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {ratingCounts.map(({ star, count, percent }) =>
                  <div key={star} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12 shrink-0">
                          <span className="text-xs font-semibold text-foreground">{star}</span>
                          <Icon name="StarIcon" size={11} className="text-amber-400" />
                        </div>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                  )}
                  </div>
                  <div className="md:w-40 shrink-0 flex items-center justify-center">
                    <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose text-sm">
                    
                      <Icon name="PencilIcon" size={14} />
                      Write Review
                    </button>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              {showReviewForm &&
            <div className="bg-card border border-primary/30 rounded-2xl p-6 shadow-card">
                  <h3 className="text-base font-bold text-foreground mb-5">Write Your Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {/* Star Rating */}
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Your Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) =>
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                      className="transition-transform hover:scale-110">
                      
                            <Icon
                        name="StarIcon"
                        size={28}
                        className={star <= (hoverRating || reviewForm.rating) ? 'text-amber-400' : 'text-gray-200'} />
                      
                          </button>
                    )}
                        <span className="ml-2 text-sm font-semibold text-foreground">
                          {reviewForm.rating === 5 ? 'Excellent' : reviewForm.rating === 4 ? 'Good' : reviewForm.rating === 3 ? 'Average' : reviewForm.rating === 2 ? 'Poor' : 'Terrible'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Review Title</label>
                      <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Summarize your experience"
                    required
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Your Review</label>
                      <textarea
                    value={reviewForm.body}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, body: e.target.value }))}
                    placeholder="Share your experience with this product..."
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                  
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Your Skin Type</label>
                      <select
                    value={reviewForm.skinType}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, skinType: e.target.value }))}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all">
                    
                        <option value="">Select skin type</option>
                        {['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Acne-prone'].map((t) =>
                    <option key={t} value={t}>{t}</option>
                    )}
                      </select>
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Add Photo (Optional)</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary cursor-pointer transition-all">
                          <Icon name="CameraIcon" size={15} />
                          Upload Photo
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                        {reviewForm.photoPreview &&
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                            <AppImage src={reviewForm.photoPreview} alt="Review photo preview" width={64} height={64} className="object-cover w-full h-full" />
                            <button
                        type="button"
                        onClick={() => setReviewForm((prev) => ({ ...prev, photoPreview: null }))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        
                              <Icon name="XMarkIcon" size={10} className="text-white" />
                            </button>
                          </div>
                    }
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose">
                        Submit Review
                      </button>
                      <button type="button" onClick={() => setShowReviewForm(false)} className="px-5 py-3 bg-secondary text-muted-foreground font-semibold rounded-xl hover:text-foreground transition-all">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
            }

              {/* Reviews List */}
              {localReviews.length === 0 ?
            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-card">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="StarIcon" size={28} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-2">No reviews yet</p>
                  <p className="text-xs text-muted-foreground">Be the first to review this product</p>
                </div> :

            <div className="space-y-4">
                  {localReviews.map((review) =>
              <div key={review.id} className="bg-card border border-border rounded-2xl p-5 shadow-card">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                          <AppImage src={review.customerAvatar} alt={review.customerAvatarAlt} width={40} height={40} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-foreground">{review.customerName}</p>
                            {review.verified &&
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">
                                <Icon name="CheckBadgeIcon" size={11} />
                                Verified Purchase
                              </span>
                      }
                            {review.skinType &&
                      <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg">{review.skinType} skin</span>
                      }
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) =>
                        <Icon key={star} name="StarIcon" size={12} className={star <= review.rating ? 'text-amber-400' : 'text-gray-200'} />
                        )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{review.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1">{review.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                      {review.photos.length > 0 &&
                <div className="flex gap-2 mt-3">
                          {review.photos.map((photo, i) =>
                  <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-border">
                              <AppImage src={photo} alt={`Review photo ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                            </div>
                  )}
                        </div>
                }
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <Icon name="HandThumbUpIcon" size={13} />
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
              )}
                </div>
            }
            </div>
          }
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 &&
        <div>
            <h2 className="text-xl font-extrabold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((related) =>
            <Link key={related.id} href={`/product-detail/${related.id}`} className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-rose transition-all group">
                  <div className="relative h-44 overflow-hidden">
                    <AppImage src={related.image} alt={related.imageAlt} width={300} height={176} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{related.brand}</p>
                    <p className="text-xs font-bold text-foreground mt-1 leading-snug line-clamp-2">{related.name}</p>
                    <p className="text-sm font-extrabold text-foreground mt-2">${related.price.toFixed(2)}</p>
                  </div>
                </Link>
            )}
            </div>
          </div>
        }
      </div>
    </div>);

}