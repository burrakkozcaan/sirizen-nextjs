'use client';

import { Check, Star, Truck } from 'lucide-react';
import type { CartModalData } from '@/types/cart-modal';

interface SellerSelectorProps {
  sellers: CartModalData['sellers'];
  selectedSellerId: number | null;
  onSellerSelect: (sellerId: number) => void;
}

export function SellerSelector({
  sellers,
  selectedSellerId,
  onSellerSelect,
}: SellerSelectorProps) {
  if (sellers.length <= 1) return null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Satıcı Seçimi ({sellers.length} satıcı)
      </label>
      
      <div className="space-y-2">
        {sellers.map((seller) => {
          const isSelected = selectedSellerId === seller.id;
          const isBestSeller = sellers[0].id === seller.id; // En ucuz satıcı

          return (
            <button
              key={seller.id}
              onClick={() => onSellerSelect(seller.id)}
              className={`
                w-full rounded-lg border p-3 text-left transition
                ${isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`
                    flex h-5 w-5 items-center justify-center rounded-full border
                    ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}
                  `}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">{seller.vendor_name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {seller.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {Number(seller.rating || 0).toFixed(1)}
                        </span>
                      )}
                      {seller.free_shipping && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Truck className="h-3 w-3" />
                          Ücretsiz Kargo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(seller.discount_price || seller.price)}
                  </p>
                  {seller.discount_price && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatPrice(seller.price)}
                    </p>
                  )}
                </div>
              </div>

              {isBestSeller && (
                <span className="mt-2 inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  En Uygun Fiyat
                </span>
              )}
            </button>
          );
        })}
      </div>
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
