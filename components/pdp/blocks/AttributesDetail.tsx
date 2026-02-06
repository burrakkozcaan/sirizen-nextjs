'use client';

import type { Product } from '@/types/pdp';

interface AttributesDetailProps {
  product: Product;
}

export function AttributesDetail({ product }: AttributesDetailProps) {
  if (!product.attributes || product.attributes.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Ürün Özellikleri</h2>
      <div className="divide-y divide-gray-100">
        {product.attributes.map((attr, index) => (
          <div key={index} className="flex py-3">
            <span className="w-1/3 text-sm text-gray-500">{attr.label}</span>
            <span className="flex-1 text-sm font-medium text-gray-900">
              {attr.display_value || attr.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
