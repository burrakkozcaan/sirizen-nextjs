"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Bell, Check, Truck, Minus, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media";
import type { ProductCore, Pricing, Engagement, Seller } from "@/actions/pdp.actions";
import type { ProductSellersResponse } from "@/actions/product-sellers.actions";
import type { UnifiedVariantConfig } from "@/types/unified-pdp";

interface AddToCartPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    core: ProductCore;
    pricing: Pricing;
    engagement: Engagement | null;
    seller: Seller | null;
  };
  sellers?: ProductSellersResponse | null;
  selectedVariantId: number | null;
  quantity: number;
  onVariantSelect: (variantId: number) => void;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  isAddingToCart?: boolean;
  isAddedToCart?: boolean;
  variants?: UnifiedVariantConfig;
  selectedAttributes?: Record<string, string>;
  onAttributeSelect?: (key: string, value: string) => void;
}

export function AddToCartPopup({
  open,
  onOpenChange,
  product,
  sellers,
  selectedVariantId,
  quantity,
  onVariantSelect,
  onQuantityChange,
  onAddToCart,
  isAddingToCart = false,
  isAddedToCart = false,
  variants: variantConfig,
  selectedAttributes = {},
  onAttributeSelect,
}: AddToCartPopupProps) {
  const { core, pricing, engagement, seller } = product;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: pricing?.currency || "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedVariant = pricing?.variants?.find((v) => v.id === selectedVariantId) || pricing?.variants?.[0];
  const displayPrice = selectedVariant?.price || pricing?.final_price || 0;
  const originalPrice = pricing?.original_price;
  const discountPercentage = originalPrice && originalPrice > displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const productImage = core.images?.[0]?.url || "";
  const productTitle = core.title;
  const brandName = core.brand?.name || "";

  // Extract color and size attributes from variant config
  // Check multiple possible ways to identify color attribute
  const colorAttribute = variantConfig?.attributes?.find(attr => {
    if (!attr) return false;
    const keyLower = (attr.key || '').toLowerCase();
    const labelLower = (attr.label || '').toLowerCase();
    const typeLower = (attr.type || '').toLowerCase();
    
    // More comprehensive check
    return (
      typeLower === 'color' || 
      keyLower === 'renk' ||
      keyLower === 'color' ||
      keyLower.includes('renk') || 
      keyLower.includes('color') ||
      labelLower.includes('renk') ||
      labelLower.includes('color')
    );
  });
  
  const sizeAttribute = variantConfig?.attributes?.find(attr => {
    const keyLower = attr.key?.toLowerCase() || '';
    const labelLower = attr.label?.toLowerCase() || '';
    return (
      attr.type === 'size' || 
      keyLower.includes('beden') || 
      keyLower.includes('size') ||
      labelLower.includes('beden') ||
      labelLower.includes('size')
    );
  });

  // Get color variants from variant config - ensure we have values
  let colorVariants = colorAttribute?.values || [];
  let fallbackColorKey: string | null = null;
  
  // Fallback: If colorAttribute not found but we have combinations with 'renk' attribute,
  // extract unique color values from combinations
  if (colorVariants.length === 0 && variantConfig?.combinations && variantConfig.combinations.length > 0) {
    const colorValuesFromCombinations = new Set<string>();
    const colorLabelsFromCombinations = new Map<string, string>();
    let foundColorKey: string | null = null;
    
    // Get all attribute keys from existing attributes (to exclude them)
    const existingAttributeKeys = new Set(
      variantConfig.attributes?.map(attr => attr.key.toLowerCase()) || []
    );
    
    // First, check all combinations to find which key contains color values
    variantConfig.combinations.forEach(combo => {
      if (combo.attributes) {
        Object.keys(combo.attributes).forEach(key => {
          const value = combo.attributes[key];
          const keyLower = key.toLowerCase();
          
          // Skip if this key is already in attributes (like beden/size)
          if (existingAttributeKeys.has(keyLower)) {
            return;
          }
          
          // If value exists and it's not beden/size, it might be color
          if (value && keyLower !== 'beden' && keyLower !== 'size') {
            colorValuesFromCombinations.add(value);
            if (!foundColorKey) {
              foundColorKey = key;
            }
            // Capitalize first letter for label
            const label = value.charAt(0).toUpperCase() + value.slice(1);
            colorLabelsFromCombinations.set(value, label);
          }
        });
      }
    });
    
    // Also check explicit color keys (even if not in attributes)
    const possibleColorKeys = ['renk', 'color', 'colour', 'rengi'];
    variantConfig.combinations.forEach(combo => {
      possibleColorKeys.forEach(key => {
        if (combo.attributes && combo.attributes[key]) {
          colorValuesFromCombinations.add(combo.attributes[key]);
          foundColorKey = key;
          const label = combo.attributes[key].charAt(0).toUpperCase() + combo.attributes[key].slice(1);
          colorLabelsFromCombinations.set(combo.attributes[key], label);
        }
      });
    });
    
    if (colorValuesFromCombinations.size > 0) {
      // Create color variants from combinations
      colorVariants = Array.from(colorValuesFromCombinations).map(value => ({
        value,
        label: colorLabelsFromCombinations.get(value) || value.charAt(0).toUpperCase() + value.slice(1),
        available: true,
        stock: 10,
        color_hex: undefined, // We don't have hex from combinations
      }));
      
      fallbackColorKey = foundColorKey;
    }
  }
  
  // Use fallback color key if colorAttribute is not found
  const effectiveColorKey = colorAttribute?.key || fallbackColorKey;
  const effectiveSelectedColor = effectiveColorKey 
    ? (selectedAttributes[effectiveColorKey] || colorVariants[0]?.value)
    : undefined;

  // Get selected color and size
  const selectedColor = effectiveSelectedColor;
  const selectedSize = sizeAttribute
    ? (selectedAttributes[sizeAttribute.key] || sizeAttribute.values?.[0]?.value)
    : undefined;

  // Get size variants (all variants that match selected color)
  const sizeVariants = variantConfig?.combinations?.filter(v => {
    if (!effectiveColorKey) return true;
    return v.attributes[effectiveColorKey] === effectiveSelectedColor;
  }) || pricing?.variants || [];

  // Find matching variant when color or size changes
  useEffect(() => {
    if (!variantConfig?.enabled || !onVariantSelect) return;
    
    const matchingVariant = variantConfig.combinations.find(v => {
      const colorMatch = !colorAttribute || v.attributes[colorAttribute.key] === selectedColor;
      const sizeMatch = !sizeAttribute || v.attributes[sizeAttribute.key] === selectedSize;
      return colorMatch && sizeMatch;
    });

    if (matchingVariant && matchingVariant.id !== selectedVariantId) {
      onVariantSelect(matchingVariant.id);
    }
  }, [selectedColor, selectedSize, variantConfig, colorAttribute, sizeAttribute, onVariantSelect, selectedVariantId]);

  // Get other sellers' variants that are not in current seller's variants
  const currentSellerVariantIds = new Set(sizeVariants.map(v => v.id));
  const otherSellerVariants = sellers?.sellers
    ?.filter(s => s.vendor_id !== seller?.id && s.variant_id && !currentSellerVariantIds.has(s.variant_id))
    .map(s => {
      const variant = pricing?.variants?.find(v => v.id === s.variant_id);
      return {
        id: s.variant_id!,
        value: variant?.value || `Varyant ${s.variant_id}`,
        price: s.price,
        stock: s.stock,
        sellerId: s.vendor_id,
        sellerName: s.vendor.name,
      };
    }) || [];
  
  // Group by variant value to avoid duplicates
  const uniqueOtherSellerVariants = Array.from(
    new Map(otherSellerVariants.map(v => [v.value, v])).values()
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "z-[101] p-0 flex flex-col",
          isMobile ? "max-h-[85vh] rounded-t-xl border-b-0" : "max-h-[90vh]"
        )}
        hideCloseButton={false}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-white z-10">
            <SheetTitle className="text-lg font-semibold">Ürün Seçenekleri</SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0">
            {/* Size Expectation Banner */}
            {engagement && engagement.reviews.total > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                <img
                  src="https://cdn.dsmcdn.com/web/production/hanger.svg"
                  alt="Beden önerisi"
                  className="w-6 h-6"
                />
                <p className="text-sm text-gray-700">
                  Kullanıcıların çoğu kendi bedeninizi almanızı öneriyor.
                </p>
              </div>
            )}

            {/* Product Info */}
            <div className="flex gap-3">
              <div className="relative w-20 h-28 flex-shrink-0 border rounded-lg overflow-hidden">
                {productImage && (
                  <Image
                    src={resolveMediaUrl(productImage)}
                    alt={productTitle}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {seller && (
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/store/${seller.slug}`}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      {seller.name}
                    </Link>
                    {seller.rating && (
                      <Badge className="text-xs bg-green-500 text-white">
                        {Number(seller.rating || 0).toFixed(1)}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {brandName && <span className="text-blue-600">{brandName} </span>}
                    {productTitle}
                  </h3>
                </div>
                {/* Free Shipping Info */}
                {seller?.shipping_speed?.same_day_shipping && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Truck className="h-3 w-3" />
                    <span>
                      Aynı Gün Kargo
                    </span>
                  </div>
                )}
                {/* Price */}
                <div className="mt-2">
                  {originalPrice && originalPrice > displayPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="text-xs text-red-600 font-medium">
                        Son 30 Günün En Düşük Fiyatı!
                      </span>
                    </div>
                  )}
                  <div className="text-lg font-bold text-orange-600">
                    {formatPrice(displayPrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Variants */}
            {variantConfig?.enabled && variantConfig.attributes && variantConfig.attributes.length > 0 && (
              <div className="space-y-4 border-t pt-4 px-4">
                {/* Color Variants */}
                {colorVariants && colorVariants.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Renk:</span>
                    {colorVariants.length > 1 && (
                      <span className="text-sm text-primary">
                        {colorVariants.length} Renk Seçeneği
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {colorVariants.map((colorValue) => {
                      const isSelected = effectiveSelectedColor === colorValue.value;
                      const colorImage = variantConfig?.combinations?.find(v => 
                        v.attributes[effectiveColorKey || 'renk'] === colorValue.value
                      )?.image || core.images?.[0]?.url;
                      
                      return (
                        <button
                          key={colorValue.value}
                          onClick={() => {
                            if (onAttributeSelect && effectiveColorKey) {
                              onAttributeSelect(effectiveColorKey, colorValue.value);
                              // Auto-select first available size for this color
                              const colorVariants = variantConfig?.combinations?.filter(v => 
                                v.attributes[effectiveColorKey] === colorValue.value
                              ) || [];
                              const firstAvailable = colorVariants.find(v => v.stock > 0);
                              if (firstAvailable && onVariantSelect) {
                                onVariantSelect(firstAvailable.id);
                              }
                            }
                          }}
                          className={cn(
                            "w-12 h-12 rounded-lg border-2 overflow-hidden transition-all",
                            isSelected
                              ? "border-primary"
                              : "border-transparent hover:border-muted-foreground/30"
                          )}
                          title={colorValue.label || colorValue.value}
                        >
                          {colorImage ? (
                            <img
                              src={resolveMediaUrl(colorImage)}
                              alt={colorValue.label || colorValue.value}
                              className="w-full h-full object-cover"
                            />
                          ) : colorValue.color_hex ? (
                            <div 
                              className="w-full h-full"
                              style={{ backgroundColor: colorValue.color_hex }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                ) : null}

              {/* Size Variants */}
              {sizeVariants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Beden:</span>
                    <button className="text-sm text-primary hover:underline">
                      Beden Tablosu
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeVariants.map((variant) => {
                      const variantValue = ('value' in variant ? variant.value : undefined) || Object.values(('attributes' in variant ? variant.attributes : {}) || {})[0] || `Varyant ${variant.id}`;
                      const isSelected = variant.id === selectedVariantId;
                      const isOutOfStock = (variant.stock || 0) === 0;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => !isOutOfStock && onVariantSelect(variant.id)}
                          disabled={isOutOfStock}
                          className={cn(
                            "min-w-[48px] h-10 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-2"
                              : "border-gray-200 hover:border-gray-300",
                            isOutOfStock && "opacity-50 cursor-not-allowed line-through relative"
                          )}
                        >
                          {variantValue}
                          {isOutOfStock && (
                            <Bell className="absolute top-1 right-1 h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < 10 && (
                    <p className="text-sm text-destructive mt-2 font-medium">
                      Son {selectedVariant.stock} ürün kaldı!
                    </p>
                  )}
                </div>
              )}

                {/* Other Seller Variants */}
                {uniqueOtherSellerVariants.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Diğer Satıcı Bedenleri</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueOtherSellerVariants.map((variant) => {
                      const isOutOfStock = (variant.stock || 0) === 0;
                      return (
                        <button
                          key={`other-${variant.id}-${variant.sellerId}`}
                          className={cn(
                            "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all relative",
                            isOutOfStock
                              ? "border-gray-200 opacity-50 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          disabled={isOutOfStock}
                          title={isOutOfStock ? "Stokta yok" : `${variant.sellerName} - ${formatPrice(variant.price)}`}
                        >
                          {variant.value}
                          {isOutOfStock && (
                            <Bell className="inline-block ml-1 h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Quantity & Add to Cart */}
          <div className="p-4 border-t bg-white flex-shrink-0 space-y-3 shadow-lg">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Adet:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="h-10 w-10 rounded-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={onAddToCart}
              disabled={isAddingToCart || isAddedToCart || !selectedVariantId}
              className={cn(
                "w-full h-12 text-base font-bold",
                isAddedToCart
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isAddingToCart ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Ekleniyor...
                </>
              ) : isAddedToCart ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Sepete Eklendi
                </>
              ) : (
                `Sepete Ekle - ${formatPrice(displayPrice * quantity)}`
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
