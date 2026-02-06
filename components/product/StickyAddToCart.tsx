"use client";

import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductVariant {
  id: number;
  value: string;
  price: number;
  original_price?: number;
  stock: number;
}

interface StickyAddToCartProps {
  productTitle: string;
  productImage?: string;
  selectedVariant: ProductVariant | null;
  selectedAttributes?: Record<string, string>;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  currentPrice: number;
  originalPrice?: number;
}

export function StickyAddToCart({
  productTitle,
  productImage,
  selectedVariant,
  selectedAttributes = {},
  quantity,
  onQuantityChange,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  currentPrice,
  originalPrice,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-card border-t shadow-lg transition-transform duration-300 translate-y-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-2">
          {/* Product Image - Hidden on small mobile */}
          {productImage && (
            <div className="hidden sm:block shrink-0">
              <img
                src={productImage}
                alt={productTitle}
                className="h-10 w-10 rounded-lg object-cover"
              />
            </div>
          )}

          {/* Price & Variant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base font-bold text-primary">{formatPrice(currentPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(originalPrice!)}
                  </span>
                  <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
                    %{discountPercentage}
                  </Badge>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {productImage && (
                <h4 className="text-[10px] text-muted-foreground truncate sm:hidden">
                  {productTitle}
                </h4>
              )}
              {/* Selected Variant Info */}
              {selectedAttributes && Object.keys(selectedAttributes).length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Object.entries(selectedAttributes).map(([key, value]) => {
                    // Skip if it's a size variant (we show it differently)
                    if (key.toLowerCase().includes('beden') || key.toLowerCase().includes('size')) {
                      return null;
                    }
                    return (
                      <Badge 
                        key={key} 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0 h-4 font-normal"
                      >
                        {key}: {value}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="sm"
            className="h-9 px-3 sm:px-4 bg-primary hover:bg-primary/90 font-semibold gap-1.5 shrink-0 text-sm"
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Sepete Ekle</span>
            <span className="xs:hidden">Ekle</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

