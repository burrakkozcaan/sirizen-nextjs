"use client";

/**
 * Sticky Add to Cart Bar
 * 
 * Scroll yapınca altta çıkan sabit sepete ekle barı
 * Trendyol tarzı
 */

import { useState } from "react";
import Image from "next/image";
import { X, Package, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { 
  UnifiedProduct, 
  UnifiedPricing, 
  UnifiedVariantConfig,
  UnifiedVariant 
} from "@/types/unified-pdp";

interface StickyAddToCartProps {
  product: UnifiedProduct;
  pricing: UnifiedPricing;
  variants: UnifiedVariantConfig;
  selectedVariant: UnifiedVariant | null;
  selectedAttributes: Record<string, string>;
  onAttributeSelect: (key: string, value: string) => void;
  onAddToCart: () => void;
  isVisible: boolean;
}

export function StickyAddToCart({
  product,
  pricing,
  variants,
  selectedVariant,
  selectedAttributes,
  onAttributeSelect,
  onAddToCart,
  isVisible,
}: StickyAddToCartProps) {
  const [showVariantSelector, setShowVariantSelector] = useState(false);

  if (!isVisible) return null;

  const finalPrice = selectedVariant?.price || pricing.sale_price || pricing.price;
  const originalPrice = pricing.original_price;

  // Check if all required variants are selected
  const allVariantsSelected = !variants.enabled || 
    variants.attributes.every(attr => selectedAttributes[attr.key]);

  return (
    <>
      {/* Backdrop for variant selector */}
      {showVariantSelector && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowVariantSelector(false)}
        />
      )}

      {/* Main Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4">
          {/* Variant Selector Dropdown */}
          {showVariantSelector && variants.enabled && (
            <div className="py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Varyant Seçin</span>
                <button 
                  onClick={() => setShowVariantSelector(false)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {variants.attributes.map((attr) => (
                  <div key={attr.key}>
                    <label className="text-sm text-gray-600 mb-2 block">
                      {attr.label}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((value) => {
                        const isSelected = selectedAttributes[attr.key] === value.value;
                        const isAvailable = value.available;
                        
                        return (
                          <button
                            key={value.value}
                            onClick={() => {
                              onAttributeSelect(attr.key, value.value);
                              // Close selector if all variants selected
                              const newSelection = { ...selectedAttributes, [attr.key]: value.value };
                              const allSelected = variants.attributes.every(
                                a => a.key === attr.key || newSelection[a.key]
                              );
                              if (allSelected) {
                                setShowVariantSelector(false);
                              }
                            }}
                            disabled={!isAvailable}
                            className={cn(
                              "px-3 py-1.5 rounded-lg border text-sm transition-all",
                              isSelected 
                                ? "border-orange-500 bg-orange-50 text-orange-700" 
                                : "border-gray-200 bg-white hover:border-gray-300",
                              !isAvailable && "opacity-50 cursor-not-allowed bg-gray-100"
                            )}
                          >
                            {attr.type === 'color' && value.color_hex && (
                              <span 
                                className="inline-block w-3 h-3 rounded-full mr-1.5 border"
                                style={{ backgroundColor: value.color_hex }}
                              />
                            )}
                            {value.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Bar Content */}
          <div className="flex items-center gap-4 py-3">
            {/* Product Image */}
            <div className="hidden sm:block relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={product.images[0]?.url || "/images/placeholder.jpg"}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {product.title}
              </h3>
              
              {/* Variant Summary */}
              {variants.enabled && (
                <button
                  onClick={() => setShowVariantSelector(!showVariantSelector)}
                  className="flex items-center gap-1 text-sm text-orange-600 mt-0.5"
                >
                  {allVariantsSelected ? (
                    <>
                      <span className="text-gray-600">Seçilen:</span>
                      <span>
                        {variants.attributes
                          .map(attr => {
                            const val = attr.values.find(v => v.value === selectedAttributes[attr.key]);
                            return val?.label;
                          })
                          .filter(Boolean)
                          .join(" / ")}
                      </span>
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span>Varyant seçin</span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-bold text-orange-600">
                  {finalPrice.toLocaleString('tr-TR')} TL
                </span>
                {originalPrice && originalPrice > finalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {originalPrice.toLocaleString('tr-TR')} TL
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              onClick={() => {
                if (variants.enabled && !allVariantsSelected) {
                  setShowVariantSelector(true);
                  return;
                }
                onAddToCart();
              }}
              disabled={pricing.stock === 0}
              className={cn(
                "bg-orange-600 hover:bg-orange-700 px-6",
                pricing.stock === 0 && "bg-gray-300 cursor-not-allowed"
              )}
            >
              <Package className="h-5 w-5 mr-2" />
              {pricing.stock === 0 
                ? 'Stok Yok' 
                : variants.enabled && !allVariantsSelected 
                  ? 'Varyant Seç' 
                  : 'Sepete Ekle'
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
