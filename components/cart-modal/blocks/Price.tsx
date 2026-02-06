'use client';

import type { CartModalData, VariantCombination, CartModalSeller } from '@/types/cart-modal';

interface PriceProps {
  product: CartModalData['product'];
  selectedVariant: VariantCombination | null;
  selectedSeller: CartModalSeller | undefined;
}

export function Price({ product, selectedVariant, selectedSeller }: PriceProps) {
  // Fiyat kaynağını belirle (varyant > satıcı > ürün)
  const price = selectedSeller?.discount_price || 
                selectedSeller?.price || 
                selectedVariant?.price || 
                product.discount_price || 
                product.price;
  
  const originalPrice = selectedSeller?.price || 
                        selectedVariant?.price || 
                        product.price;

  const hasDiscount = price < originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="rounded-xl bg-orange-50 p-4">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-orange-700">
          {formatPrice(price)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
            <span className="rounded bg-orange-200 px-2 py-1 text-sm font-semibold text-orange-800">
              %{discountPercentage}
            </span>
          </>
        )}
      </div>
      
      {/* Satıcı bilgisi (çoklu satıcı varsa) */}
      {selectedSeller && (
        <p className="mt-2 text-sm text-gray-600">
          Satıcı: <span className="font-medium text-gray-800">{selectedSeller.vendor_name}</span>
        </p>
      )}
    </div>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(price);
}
