'use client';

import type { Product } from '@/types/pdp';

interface TitleProps {
  product: Product;
}

export function Title({ product }: TitleProps) {
  return (
    <div className="space-y-2">
      {product.brand && (
        <p className="text-sm font-medium text-orange-600">{product.brand}</p>
      )}
      <h1 className="text-2xl font-bold leading-tight text-gray-900">
        {product.title}
      </h1>
    </div>
  );
}
