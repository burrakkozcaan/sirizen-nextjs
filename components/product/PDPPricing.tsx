"use client";

import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Bell, Edit3, Minus, Plus } from "lucide-react";
import type { Pricing } from "@/actions/pdp.actions";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePriceAlert } from "@/contexts/PriceAlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { PriceAlertModal } from "./PriceAlertModalSimple";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PDPPricingProps {
  productId: number;
  pricingPromise: Promise<Pricing | null>;
}

export function PDPPricing({ productId, pricingPromise }: PDPPricingProps) {
  return (
    <Suspense fallback={<PDPPricingSkeleton />}>
      <PDPPricingContent productId={productId} pricingPromise={pricingPromise} />
    </Suspense>
  );
}

async function PDPPricingContent({
  productId,
  pricingPromise,
}: PDPPricingProps) {
  const pricing = await pricingPromise;

  if (!pricing) {
    return null;
  }

  return <PDPPricingClient productId={productId} pricing={pricing} />;
}

function PDPPricingClient({
  productId,
  pricing,
}: {
  productId: number;
  pricing: Pricing;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { hasAlert } = usePriceAlert();
  const [priceAlertOpen, setPriceAlertOpen] = useState(false);
  const hasPriceAlert = hasAlert(productId);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    pricing.variants.find(v => v.is_default)?.id || pricing.variants[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: pricing.currency || "TRY",
    }).format(price);
  };

  const discountPercentage = pricing.original_price
    ? Math.round(
        ((pricing.original_price - pricing.final_price) /
          pricing.original_price) *
          100
      )
    : 0;

  const selectedVariant = pricing.variants.find(v => v.id === selectedVariantId) || pricing.variants[0];
  const displayPrice = selectedVariant?.price || pricing.final_price;
  const displayStock = selectedVariant?.stock ?? pricing.stock;
  const isInStock = (selectedVariant?.stock ?? pricing.stock) > 0;

  const handleAddToCart = () => {
    addItem({
      product_id: productId,
      variant_id: selectedVariantId || pricing.variant_id,
      quantity: quantity,
    });
    toast.success("Ürün sepete eklendi");
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      {/* Price */}
      <div>
        {pricing.original_price && pricing.original_price > displayPrice && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(displayPrice)}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(pricing.original_price)}
            </span>
            {discountPercentage > 0 && (
              <Badge variant="destructive">%{discountPercentage}</Badge>
            )}
          </div>
        )}
        {(!pricing.original_price ||
          pricing.original_price === displayPrice) && (
          <div className="text-2xl font-bold text-primary">
            {formatPrice(displayPrice)}
          </div>
        )}
      </div>

      {/* Campaign Badge */}
      {pricing.campaign && (
        <Badge variant="secondary" className="w-fit">
          {pricing.campaign.title}
        </Badge>
      )}

      {/* Stock Status */}
      <div>
        {isInStock ? (
          <p className="text-sm text-green-600 font-medium">
            Stokta var {displayStock > 0 && displayStock < 10 && `(Son ${displayStock} ürün!)`}
          </p>
        ) : (
          <p className="text-sm text-red-600 font-medium">Stokta yok</p>
        )}
      </div>

      {/* Variants */}
      {pricing.variants.length > 1 && (
        <div>
          <p className="text-sm font-medium mb-2">Varyant Seçimi:</p>
          <div className="flex flex-wrap gap-2">
            {pricing.variants.map((variant) => (
              <Button
                key={variant.id}
                variant={selectedVariantId === variant.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedVariantId(variant.id)}
                disabled={variant.stock === 0}
                className={cn(
                  variant.stock === 0 && "opacity-50 line-through"
                )}
              >
                {formatPrice(variant.price)}
                {variant.stock === 0 && " (Tükendi)"}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <p className="text-sm font-medium mb-2">Adet:</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="rounded-full h-10 w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= (displayStock || 99)}
            className="rounded-full h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={!isInStock}
          className="flex-1"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Sepete Ekle
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (!isAuthenticated) {
              toast.error("Koleksiyona eklemek için lütfen giriş yapın");
              router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
              return;
            }
            toggleFavorite(productId);
          }}
          aria-label={isFavorite(productId) ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite(productId) ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </Button>
        <Button 
          variant="outline" 
          aria-label="Fiyat uyarısı"
          onClick={() => {
            if (!isAuthenticated) {
              toast.error("Fiyat alarmı kurmak için lütfen giriş yapın");
              router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
              return;
            }
            setPriceAlertOpen(true);
          }}
        >
          <Bell className="w-4 h-4" />
        </Button>
      </div>

      {/* Price Alert Button */}
      <Button
        variant="outline"
        className={cn(
          'w-full h-11',
          hasPriceAlert && 'border-primary/50 bg-primary/5 text-primary'
        )}
        onClick={() => {
          if (!isAuthenticated) {
            toast.error("Fiyat alarmı kurmak için lütfen giriş yapın");
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
          }
          setPriceAlertOpen(true);
        }}
      >
        <Bell className={cn('h-4 w-4 mr-2', hasPriceAlert && 'text-primary')} />
        {hasPriceAlert ? 'Fiyat Alarmı Aktif' : 'Fiyat Düşünce Haber Ver'}
      </Button>

      {/* Price Alert Modal */}
      <PriceAlertModal
        productId={productId}
        currentPrice={displayPrice}
        open={priceAlertOpen}
        onOpenChange={setPriceAlertOpen}
      />

      {/* Write Review Button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => {
          // Navigate to reviews section or open review modal
          const reviewsSection = document.getElementById('reviews-section');
          if (reviewsSection) {
            reviewsSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            toast.info('Değerlendirmeler bölümüne gidin');
          }
        }}
      >
        <Edit3 className="w-4 h-4" />
        Değerlendirme Yaz
      </Button>
    </div>
  );
}

function PDPPricingSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

