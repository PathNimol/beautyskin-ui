'use client';

import { use } from 'react';
import ProductDetailClient from '@/app/product-detail/[id]/ProductDetailClient';

export default function CustomerProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ProductDetailClient productId={id} />;
}
