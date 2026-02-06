'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Product } from '@/types/pdp';

interface DescriptionProps {
  product: Product;
}

export function Description({ product }: DescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!product.description) return null;

  const shouldTruncate = product.description.length > 300;
  const displayText = isExpanded 
    ? product.description 
    : product.description.slice(0, 300);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Ürün Açıklaması</h2>
      <div className="prose prose-sm max-w-none text-gray-600">
        <p className="whitespace-pre-line">{displayText}</p>
        {!isExpanded && shouldTruncate && '...'}
      </div>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          {isExpanded ? 'Daha Az Göster' : 'Devamını Oku'}
          <ChevronDown className={`h-4 w-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
