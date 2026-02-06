import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getUnifiedPdp } from "@/actions/unified-pdp.actions";
import { ProductClient } from "./ProductClient";
import { ProductSkeleton } from "./ProductSkeleton";

export const metadata = {
  title: "Ürün Detayı",
  description: "Ürün detay sayfası",
};

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent slug={slug} />
    </Suspense>
  );
}

async function ProductContent({ slug }: { slug: string }) {
  // Unified PDP - Single endpoint, single schema
  const pdpData = await getUnifiedPdp(slug, { context: 'page' });

  if (!pdpData) {
    notFound();
  }

  return <ProductClient data={pdpData} />;
}
