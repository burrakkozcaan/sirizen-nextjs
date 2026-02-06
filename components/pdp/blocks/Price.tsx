'use client';

import type { Product } from '@/types/pdp';

interface PriceProps {
  product: Product;
}

export function Price({ product }: PriceProps) {
  const { price, discount_price, discount_percentage, currency } = product;
  const hasDiscount = discount_price && discount_price < price;

  return (
    <div className="space-y-2">
      {hasDiscount ? (
        <>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-orange-600">
              {formatPrice(discount_price!, currency)}
            </span>
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(price, currency)}
            </span>
          </div>
          {discount_percentage && (
            <div className="flex items-center gap-2">
              <span className="rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                %{Math.round(discount_percentage)} İndirim
              </span>
              <span className="text-sm text-green-600">
                {formatPrice(price - discount_price!, currency)} tasarruf
              </span>
            </div>
          )}
        </>
      ) : (
        <span className="text-3xl font-bold text-gray-900">
          {formatPrice(price, currency)}
        </span>
      )}
    </div>
  );
}

function formatPrice(price: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
