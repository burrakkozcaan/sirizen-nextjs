'use client';

import { usePdpWithUrl } from '@/hooks/usePdpWithUrl';
import { PdpBlockRenderer } from './PdpBlockRenderer';
import { ProductSkeleton } from './ProductSkeleton';

interface PdpEngineProps {
  slug: string;
}

export function PdpEngine({ slug }: PdpEngineProps) {
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

  // Group blocks by position
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {blocksByPosition.main?.sort((a, b) => a.order - b.order).map((block) => (
            <PdpBlockRenderer
              key={block.block}
              block={block}
              product={productWithVariant}
              badges={badges}
              highlights={highlights}
              socialProof={social_proof}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          {blocksByPosition.sidebar?.sort((a, b) => a.order - b.order).map((block) => (
            <PdpBlockRenderer
              key={block.block}
              block={block}
              product={productWithVariant}
              badges={badges}
              highlights={highlights}
              socialProof={social_proof}
            />
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-12">
        {blocksByPosition.bottom?.sort((a, b) => a.order - b.order).map((block) => (
          <PdpBlockRenderer
            key={block.block}
            block={block}
            product={productWithVariant}
            badges={badges}
            highlights={highlights}
            socialProof={social_proof}
          />
        ))}
      </div>
    </div>
  );
}
