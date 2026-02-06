"use server";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPdpEngineData } from "@/actions/pdp-engine.actions";
import { PdpEngineRenderer } from "@/components/product/pdp-engine";
import { ProductSkeleton } from "./ProductSkeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Ürün Detayı - PDP Engine",
  description: "Trendyol tarzı dinamik ürün detay sayfası",
};

/**
 * PDP Engine Page - Trendyol-style Dynamic Product Page
 * 
 * Bu sayfa, kategori bazlı dinamik PDP yapısını kullanır:
 * - Layout: Kategori grubuna göre blok dizilimi
 * - Badges: Kurallı otomatik hesaplanan rozetler
 * - Highlights: Öne çıkan özellikler
 * - Social Proof: Sosyal kanıt mesajları
 */
export default async function PdpEnginePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <PdpEngineContent slug={slug} />
    </Suspense>
  );
}

async function PdpEngineContent({ slug }: { slug: string }) {
  // PDP Engine'den tüm veriyi tek istekte al
  const pdpData = await getPdpEngineData(slug);

  if (!pdpData) {
    notFound();
  }

  const { product } = pdpData;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Anasayfa</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          {product.category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/category/${product.category.slug}`}>
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* PDP Engine Renderer */}
      <PdpEngineRenderer data={pdpData} />
    </div>
  );
}
