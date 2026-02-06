'use client';

import { Check } from 'lucide-react';
import type { CartModalData, VariantCombination } from '@/types/cart-modal';

interface VariantSelectorProps {
  variants: CartModalData['variants'];
  selectedAttributes: Record<string, string>;
  selectedVariant: VariantCombination | null;
  onAttributeSelect: (key: string, value: string) => void;
  type?: string; // 'size', 'color', 'volume' vb.
}

export function VariantSelector({
  variants,
  selectedAttributes,
  selectedVariant,
  onAttributeSelect,
}: VariantSelectorProps) {
  if (!variants.has_variants) return null;

  return (
    <div className="space-y-3">
      {variants.options.map((option) => (
        <div key={option.key}>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {option.label}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedAttributes[option.key] === value.value;
              const isAvailable = value.available;

              return (
                <button
                  key={value.value}
                  onClick={() => isAvailable && onAttributeSelect(option.key, value.value)}
                  disabled={!isAvailable}
                  className={`
                    relative rounded-lg border px-4 py-2 text-sm transition
                    ${isSelected
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : isAvailable
                      ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      : 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 line-through'
                    }
                  `}
                >
                  {value.value}
                  
                  {/* Stok bilgisi (düşük stoklu ürünler için) */}
                  {isAvailable && value.stock > 0 && value.stock < 5 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500"></span>
                    </span>
                  )}
                  
                  {isSelected && (
                    <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-orange-500 text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Seçili varyant bilgisi */}
      {selectedVariant && (
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <p className="text-gray-600">
            Seçilen: <span className="font-medium text-gray-900">
              {Object.entries(selectedVariant.attributes).map(([k, v]) => `${v}`).join(' / ')}
            </span>
          </p>
          {selectedVariant.stock < 5 && (
            <p className="mt-1 text-xs text-orange-600">
              Son {selectedVariant.stock} adet kaldı!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
