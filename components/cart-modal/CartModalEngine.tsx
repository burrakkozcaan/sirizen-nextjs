"use client";

/**
 * Unified Cart Modal Engine
 * 
 * PDP'nin küçültülmüş versiyonu - Unified Schema kullanır
 * Tek endpoint: /api/pdp/{slug}?context=modal
 * 
 * Block-based render: Backend ne gönderirse o render edilir
 * Kozmetikte beden çıkmaz çünkü backend göndermez
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { X, Package, Flame, Star, ChevronDown } from 'lucide-react';
import { getUnifiedPdp } from '@/actions/unified-pdp.actions';
import type { UnifiedPdpResponse, UnifiedVariant } from '@/types/unified-pdp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CartModalEngineProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (variant: UnifiedVariant | null, quantity: number) => void;
}

export function CartModalEngine({ 
  slug, 
  isOpen, 
  onClose,
  onAddToCart 
}: CartModalEngineProps) {
  const [data, setData] = useState<UnifiedPdpResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Modal verisini çek - Unified PDP kullanır
  useEffect(() => {
    if (!isOpen || !slug) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Unified PDP: context=modal ile sadece gerekli blokları getir
        const response = await getUnifiedPdp(slug, { context: 'modal' });
        
        if (response) {
          setData(response);
          // Varsayılan satıcıyı seç
          if (response.vendors.length > 0) {
            setSelectedSellerId(response.vendors[0].id);
          }
        } else {
          throw new Error('Failed to fetch cart modal data');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, isOpen]);

  // Mevcut seçime göre varyantı bul
  const selectedVariant = useMemo(() => {
    if (!data?.variants.enabled) return null;
    if (Object.keys(selectedAttributes).length === 0) return null;

    return data.variants.combinations.find((combo) =>
      Object.entries(selectedAttributes).every(
        ([key, value]) => combo.attributes[key] === value
      )
    ) || null;
  }, [selectedAttributes, data?.variants]);

  // Attribute seçimi
  const handleAttributeSelect = useCallback((key: string, value: string) => {
    setSelectedAttributes(prev => {
      if (prev[key] === value) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  // Satıcı seçimi
  const handleSellerSelect = useCallback((sellerId: number) => {
    setSelectedSellerId(sellerId);
  }, []);

  // Sepete ekle
  const handleAddToCart = useCallback(async () => {
    if (!data) return;

    // Rule: Varyant seçimi zorunlu mu?
    if (data.rules.disable_add_until_variant_selected && 
        data.variants.enabled && 
        !selectedVariant) {
      toast.error('Lütfen bir varyant seçin');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      await onAddToCart?.(selectedVariant, 1);
      onClose();
      toast.success('Sepete eklendi');
    } finally {
      setIsAddingToCart(false);
    }
  }, [data, selectedVariant, onAddToCart, onClose]);

  // Sepete ekle butonu disabled mı?
  const isAddToCartDisabled = useMemo(() => {
    if (!data) return true;
    if (isAddingToCart) return true;
    
    // Rule: Varyant seçimi zorunlu mu?
    if (data.rules.disable_add_until_variant_selected && 
        data.variants.enabled && 
        !selectedVariant) {
      return true;
    }

    // Stok yok mu?
    if (data.pricing.stock === 0) return true;
    if (selectedVariant && selectedVariant.stock === 0) return true;

    return false;
  }, [data, selectedVariant, isAddingToCart]);

  // Check if block should be shown
  const hasBlock = (blockName: string) => 
    data?.blocks.some(b => b.block === blockName && b.visible);

  if (!isOpen) return null;

  const selectedSeller = data?.vendors.find(v => v.id === selectedSellerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Ürün Seçenekleri
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {isLoading ? (
            <CartModalSkeleton />
          ) : error || !data ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Ürün bilgileri yüklenemedi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Info Block */}
              {hasBlock('title') && (
                <div className="flex gap-4">
                  {hasBlock('gallery') && data.product.images[0] && (
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={data.product.images[0].url}
                        alt={data.product.title}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {data.product.title}
                    </h3>
                    {hasBlock('badges') && data.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {data.badges.slice(0, 2).map((badge) => (
                          <Badge 
                            key={badge.key}
                            className={cn(
                              "text-xs",
                              badge.bg_color || "bg-primary",
                              badge.color || "text-white"
                            )}
                          >
                            {badge.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Block */}
              {hasBlock('price') && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-orange-600">
                      {(selectedVariant?.price || data.pricing.sale_price || data.pricing.price).toLocaleString('tr-TR')} TL
                    </span>
                    {data.pricing.original_price && (
                      <span className="text-sm text-gray-400 line-through">
                        {data.pricing.original_price.toLocaleString('tr-TR')} TL
                      </span>
                    )}
                  </div>
                  {data.pricing.stock_status === 'low_stock' && (
                    <p className="text-orange-600 text-sm mt-1 flex items-center gap-1">
                      <Flame className="h-4 w-4" />
                      Sadece {data.pricing.stock} adet kaldı!
                    </p>
                  )}
                </div>
              )}

              {/* Variant Selector Block */}
              {hasBlock('variant_selector') && data.variants.enabled && (
                <div className="space-y-3">
                  {data.variants.attributes.map((attr) => (
                    <div key={attr.key}>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {attr.label}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((value) => {
                          const isSelected = selectedAttributes[attr.key] === value.value;
                          const isAvailable = value.available;
                          
                          return (
                            <button
                              key={value.value}
                              onClick={() => isAvailable && handleAttributeSelect(attr.key, value.value)}
                              disabled={!isAvailable}
                              className={cn(
                                "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                                isSelected 
                                  ? "border-orange-500 bg-orange-50 text-orange-700" 
                                  : "border-gray-200 hover:border-gray-300",
                                !isAvailable && "opacity-50 cursor-not-allowed bg-gray-100"
                              )}
                            >
                              {attr.type === 'color' && value.color_hex && (
                                <span 
                                  className="inline-block w-4 h-4 rounded-full mr-2 border"
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
              )}

              {/* Seller Selector Block */}
              {hasBlock('seller_selector') && data.rules.allow_multi_seller && data.vendors.length > 1 && (
                <div className="border rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Satıcı Seçin
                  </label>
                  <div className="space-y-2">
                    {data.vendors.map((vendor) => (
                      <button
                        key={vendor.id}
                        onClick={() => handleSellerSelect(vendor.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                          selectedSellerId === vendor.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-sm">{vendor.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{vendor.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-orange-600">
                            {vendor.price?.toLocaleString('tr-TR')} TL
                          </p>
                          {vendor.shipping.free_shipping_threshold && (
                            <p className="text-xs text-green-600">
                              {vendor.shipping.free_shipping_threshold} TL üzeri kargo bedava
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Campaigns Block */}
              {hasBlock('campaigns') && data.campaigns.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Kampanyalar</h4>
                  {data.campaigns.map((campaign) => (
                    <div 
                      key={campaign.id}
                      className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{campaign.title}</span>
                        {campaign.badge_text && (
                          <Badge variant="secondary" className="text-xs">
                            {campaign.badge_text}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Add to Cart */}
        {!isLoading && data && (
          <div className="border-t p-4">
            <Button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-base"
            >
              {isAddingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton Loading
function CartModalSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="h-24 w-24 flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
      <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
    </div>
  );
}
