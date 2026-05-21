import React from "react";
import ProductDetailClient from "@/app/product-detail/[id]/ProductDetailClient";
import DashboardLayout from "@/components/DashboardLayout";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DashboardLayout title="Product Detail" subtitle="Browse skincare from every shop on the platform">
      <ProductDetailClient productId={id} />
    </DashboardLayout>
  );
}
