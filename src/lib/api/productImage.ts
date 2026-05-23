import type { ApiProduct } from './types';

/** Product photos should come from the API (Unsplash URLs in DB), not Rocket mock CDN. */
export function isValidProductImage(url?: string | null): boolean {
  if (!url?.trim()) return false;
  const lower = url.toLowerCase();
  if (lower.includes('rocket.new') || lower.includes('rocket_gen_img')) return false;
  return lower.startsWith('http');
}

/** Prefer primary `image`, then first gallery entry from GET /api/products. */
export function resolveProductImageUrl(p: Pick<ApiProduct, 'image' | 'imageAlt' | 'images' | 'name'>): {
  image: string;
  alt: string;
} {
  const primary = p.image?.trim();
  const gallery = p.images?.[0]?.src?.trim();
  const image = isValidProductImage(primary)
    ? primary!
    : isValidProductImage(gallery)
      ? gallery!
      : '';
  return {
    image,
    alt: p.imageAlt?.trim() || p.images?.[0]?.alt?.trim() || p.name,
  };
}
