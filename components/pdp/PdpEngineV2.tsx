'use client';

/**
 * PDP Engine V2
 * 
 * Yeni özellikler:
 * - URL State: Variant seçimleri URL'e yazılır (?size=M&color=black)
 * - Optimized Social Proof: visibilitychange ile optimize edilmiş
 * - Block Versioning: A/B test desteği
 * - Fallback Blocks: Bilinmeyen bloklar için güvenli fallback
 */

import { usePdpWithUrl } from '@/hooks/usePdpWithUrl';
import { PdpBlockRenderer } from './PdpBlockRenderer';
import { ProductSkeleton } from './ProductSkeleton';
import { Suspense } from 'react';

interface PdpEngineV2Props {
  slug: string;
}

export function PdpEngineV2({ slug }: PdpEngineV2Props) {
  const { data, isLoading, error, selectedVariant } = usePdpWithUrl(slug);

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Ürün bulunamadı</h2>
          <p className="mt-2 text-gray-600">Aradığınız ürün mevcut değil veya kaldırılmış.</p>
        </div>
      </div>
    );
  }

  const { product, layout, badges, highlights, social_proof } = data;

  // Layout'u pozisyona göre grupla
  const blocksByPosition = layout.reduce((acc, block) => {
    const position = block.position || 'main';
    if (!acc[position]) acc[position] = [];
    acc[position].push(block);
    return acc;
  }, {} as Record<string, typeof layout>);

  // Seçili varyant bilgilerini product'a inject et
  const productWithVariant = selectedVariant
    ? { ...product, selectedVariant }
    : product;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ✅ URL State Debug (development only) */}
      {process.env.NODE_ENV === 'development' && selectedVariant && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
          <p className="font-medium">Debug: URL State</p>
          <p>Variant: {selectedVariant.title} (ID: {selectedVariant.id})</p>
          <p>Stock: {selectedVariant.stock}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <Suspense fallback={<BlockSkeleton />}>
            {blocksByPosition.main
              ?.sort((a, b) => a.order - b.order)
              .map((block) => (
                <PdpBlockRenderer
                  key={`${block.block}-${block.order}`}
                  block={block}
                  product={productWithVariant}
                  badges={badges}
                  highlights={highlights}
                  socialProof={social_proof}
                />
              ))}
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <Suspense fallback={<BlockSkeleton />}>
            {blocksByPosition.sidebar
              ?.sort((a, b) => a.order - b.order)
              .map((block) => (
                <PdpBlockRenderer
                  key={`${block.block}-${block.order}`}
                  block={block}
                  product={productWithVariant}
                  badges={badges}
                  highlights={highlights}
                  socialProof={social_proof}
                />
              ))}
          </Suspense>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-12">
        <Suspense fallback={<BlockSkeleton />}>
          {blocksByPosition.bottom
            ?.sort((a, b) => a.order - b.order)
            .map((block) => (
              <PdpBlockRenderer
                key={`${block.block}-${block.order}`}
                block={block}
                product={productWithVariant}
                badges={badges}
                highlights={highlights}
                socialProof={social_proof}
              />
            ))}
        </Suspense>
      </div>
    </div>
  );
}

// Blok yüklenirken skeleton
function BlockSkeleton() {
  return (
    <div className="mb-6 space-y-4">
      <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
    </div>
  );
}
