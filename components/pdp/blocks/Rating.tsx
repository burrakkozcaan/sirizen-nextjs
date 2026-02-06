'use client';

import { Star } from 'lucide-react';
import type { Product } from '@/types/pdp';

interface RatingProps {
  product: Product;
}

export function Rating({ product }: RatingProps) {
  const { rating, reviews_count } = product;

  if (reviews_count === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
      </div>
      <span className="text-gray-400">|</span>
      <a href="#reviews" className="text-sm text-gray-600 hover:text-orange-600 hover:underline">
        {reviews_count} Değerlendirme
      </a>
    </div>
  );
}
