"use client";

import { Suspense, useState } from "react";
import { claimCoupon } from "@/actions/coupon.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  Heart,
  Sparkles,
  Minus,
  Plus,
  Bell,
  Edit3,
  ChevronRight,
  Tag,
  HelpCircle,
} from "lucide-react";
import type { ProductCore, Pricing, Engagement } from "@/actions/pdp.actions";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePriceAlert } from "@/contexts/PriceAlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { SocialProofBadges } from "./SocialProofBadges";
import { DeliveryInfoBox } from "./DeliveryInfoBox";
import { PriceAlertModal } from "./PriceAlertModalSimple";
import { WriteReviewModal } from "./WriteReviewModal";
import { VariantSlider } from "./VariantSlider";
import { ProductAttributesSlider } from "./ProductAttributesSlider";
import { CampaignBanner } from "./CampaignBanner";
import { AddToCartPopup } from "./AddToCartPopup";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Seller } from "@/actions/pdp.actions";
import type { ProductSellersResponse } from "@/actions/product-sellers.actions";
import { TicketPercent } from "lucide-react";

interface PDPProductInfoProps {
  core: ProductCore;
  pricing: Pricing;
  engagement: Engagement | null;
  productId: number;
  seller?: Seller | null;
  sellers?: ProductSellersResponse | null;
  campaigns?: Array<{
    id: number;
    type: 'coupon' | 'discount' | 'bundle' | 'flash';
    title: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    min_order?: number;
  }>;
}

export function PDPProductInfo({
  core,
  pricing,
  engagement,
  productId,
  seller,
  sellers,
  campaigns = [],
}: PDPProductInfoProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isClaimingCoupon, setIsClaimingCoupon] = useState(false);
  
  // Find first available coupon
  const availableCoupon = campaigns.find(c => c.type === 'coupon');
  const { hasAlert } = usePriceAlert();
  const [priceAlertOpen, setPriceAlertOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [addToCartPopupOpen, setAddToCartPopupOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    pricing?.variants?.find((v) => v.is_default)?.id || pricing?.variants?.[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);

  // Safety check
  if (!pricing) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: pricing.currency || "TRY",
    }).format(price);
  };

  const selectedVariant = pricing?.variants?.find((v) => v.id === selectedVariantId) || pricing?.variants?.[0];
  const displayPrice = selectedVariant?.price || pricing?.final_price || 0;
  const displayStock = selectedVariant?.stock ?? pricing?.stock ?? 0;
  const isInStock = (selectedVariant?.stock ?? pricing?.stock ?? 0) > 0;
  const originalPrice = pricing?.original_price;
  const discountPercentage = originalPrice && originalPrice > displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const isFav = isFavorite(productId);
  const hasPriceAlert = hasAlert(productId);

  const handleAddToCart = () => {
    // This function opens the AddToCartPopup which handles the actual add to cart
    handleOpenAddToCartPopup();
  };

  const handleOpenAddToCartPopup = () => {
    setAddToCartPopupOpen(true);
    setIsAddedToCart(false);
  };

  // Format favorite count
  const favoriteCount = engagement?.favorite_count || 0;
  const favoriteCountFormatted = favoriteCount >= 1000
    ? `${(favoriteCount / 1000).toFixed(1).replace(".0", "")}B`
    : favoriteCount.toLocaleString();

  return (
    <div className="space-y-5">
      {/* Brand & Title */}
      <div>
                <Link
                  href={`/brand/${core.brand.slug}`}
                  className="text-base font-bold text-blue-600 hover:text-blue-700"
                >
                  {core.brand.name}
                </Link>
                <h1 className="text-lg text-gray-800 font-normal mt-1 leading-snug">
                  {core.title}
                </h1>

        {/* Rating Row - Trendyol Style */}
        {engagement && engagement.reviews.total > 0 && (
          <div className="flex items-center justify-between h-5 mt-3">
            <Link
              href={`#reviews-section`}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
            >
              {/* Rating Detail */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold">
                  {engagement.reviews.average_rating.toFixed(1)}
                </span>
                {/* Star Rating - Trendyol Style */}
                <div 
                  className="relative cursor-pointer"
                  style={{ 
                    height: '13px',
                    aspectRatio: '43 / 7',
                    minHeight: '9px',
                    width: 'fit-content'
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      backgroundImage: `url('https://cdn.dsmcdn.com/web/production/full.svg')`,
                      backgroundPosition: '0',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'contain',
                      backgroundClip: 'content-box',
                      boxSizing: 'border-box',
                      paddingRight: `${((5 - engagement.reviews.average_rating) / 5) * 43}px`,
                    }}
                  />
                </div>
              </div>
              {/* Reviews Detail */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm">
                  <b>{engagement.reviews.total.toLocaleString()}</b> Değerlendirme
                </span>
                {/* Photo Review Icon */}
                <img
                  src="https://cdn.dsmcdn.com/mnresize/30/30/mobile/reviewrating/kamera-emoji6x.png"
                  alt="Fotoğraflı yorum iconu"
                  className="w-[18px] h-[14px]"
                  loading="lazy"
                />
              </div>
            </Link>
            {/* Q&A Count */}
            {engagement.qa_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>•</span>
                <span>{engagement.qa_count} Soru-Cevap</span>
              </div>
            )}
          </div>
        )}

        {/* User feedback */}
        {engagement && engagement.reviews.average_rating >= 4 && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Kullanıcılar Beğeniyor!</span>
            </span>
            <Button variant="link" className="text-primary p-0 h-auto text-sm">
              Yorumları İncele →
            </Button>
          </div>
        )}

        {/* Favorites count */}
        {favoriteCount > 0 && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
            <span className="text-muted-foreground">Sevilen ürün!</span>
            <span className="text-primary font-semibold">{favoriteCountFormatted}</span>
            <span className="text-muted-foreground">kişi favoriledi!</span>
          </div>
        )}
      </div>

      {/* Campaign Banner - Trendyol Style */}
      <CampaignBanner />

      {/* Price - Trendyol Style */}
      <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-orange-600">
            {formatPrice(displayPrice)}
          </span>
          {originalPrice && originalPrice > displayPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {originalPrice && originalPrice > displayPrice && (
          <div className="text-xs text-red-600 font-medium mt-1">
            Son 30 Günün En Düşük Fiyatı!
          </div>
        )}
      </div>

      {/* Coupon Opportunity - Trendyol Style */}
      {availableCoupon && (
        <>
          <div className="border border-pink-200 bg-pink-50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TicketPercent className="text-pink-600 w-5 h-5" />
              <div className="text-sm">
                <span className="font-bold text-gray-800">
                  {availableCoupon.discount_type === 'percentage' 
                    ? `%${availableCoupon.discount_value} İndirim`
                    : `${availableCoupon.discount_value} TL İndirim`}
                </span>
                <span className="text-gray-600 text-xs ml-1">Sepette Ekstra</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-pink-600 hover:text-pink-700 hover:bg-pink-100 font-bold h-8"
              onClick={async () => {
                if (!isAuthenticated) {
                  toast.error("Kupon kazanmak için lütfen giriş yapın");
                  router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                  return;
                }
                
                setIsClaimingCoupon(true);
                try {
                  const result = await claimCoupon(availableCoupon.id, productId);
                  if (result.success) {
                    toast.success(result.message || "Kupon başarıyla kazandınız!", {
                      description: result.couponCode ? `Kupon kodu: ${result.couponCode}` : undefined,
                    });
                  } else {
                    toast.error(result.error || "Kupon kazanılamadı");
                  }
                } catch (error) {
                  toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
                } finally {
                  setIsClaimingCoupon(false);
                }
              }}
              disabled={isClaimingCoupon}
            >
              {isClaimingCoupon ? "Kazanılıyor..." : "Kuponu Topla"}
            </Button>
          </div>

          {/* Mobile Coupon */}
          <div className="mt-3 flex items-center gap-2 bg-pink-50 border border-pink-100 p-2 rounded-lg w-fit md:hidden">
            <div className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">%</div>
            <span className="text-xs font-semibold text-gray-700">Kupon Fırsatı!</span>
            <button 
              className="text-xs font-bold text-pink-500 border border-pink-500 rounded px-2 py-0.5 ml-2 hover:bg-pink-500 hover:text-white transition disabled:opacity-50"
              onClick={async () => {
                if (!isAuthenticated) {
                  toast.error("Kupon kazanmak için lütfen giriş yapın");
                  router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                  return;
                }
                
                setIsClaimingCoupon(true);
                try {
                  const result = await claimCoupon(availableCoupon.id, productId);
                  if (result.success) {
                    toast.success(result.message || "Kupon başarıyla kazandınız!", {
                      description: result.couponCode ? `Kupon kodu: ${result.couponCode}` : undefined,
                    });
                  } else {
                    toast.error(result.error || "Kupon kazanılamadı");
                  }
                } catch (error) {
                  toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
                } finally {
                  setIsClaimingCoupon(false);
                }
              }}
              disabled={isClaimingCoupon}
            >
              {isClaimingCoupon ? "..." : "Kazan"}
            </button>
          </div>
        </>
      )}

      {/* Sales Proof */}
      <div className="mt-3 text-xs text-gray-600 flex items-center gap-1">
        🚀 <span className="font-bold text-orange-500">3 günde {Math.floor((engagement?.purchase_count || 0) / 30) || 127} ürün</span> satıldı!
      </div>

      {/* Social Proof Badges */}
      {engagement && (
        <SocialProofBadges
          cartCount={engagement.cart_count}
          viewCount24h={Math.floor(engagement.view_count / 30)}
          soldCount3d={Math.floor(engagement.purchase_count / 30)}
        />
      )}

      {/* Variants - Trendyol Style Slider (Desktop Only) */}
      {pricing?.variants && pricing.variants.length > 1 && (
        <>
          <div className="hidden lg:block">
            <VariantSlider
              variants={pricing.variants}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
              title="Beden"
              selectedValue={selectedVariant?.value}
            />
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < 10 && (
              <p className="text-sm text-destructive">
                Son {selectedVariant.stock} ürün!
              </p>
            )}
          </div>
        </>
      )}

      {/* Quantity - Desktop Only */}
      <div className="hidden lg:block">
        <h3 className="font-medium mb-2">Adet:</h3>
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

      {/* Actions - Desktop Only */}
      <div className="hidden lg:flex gap-3 pt-2">
        <Button
          size="lg"
          className="flex-1 bg-orange-600 hover:bg-orange-700 h-12 text-base font-bold shadow-lg shadow-orange-200"
          onClick={handleOpenAddToCartPopup}
          disabled={!isInStock}
        >
          Sepete Ekle
        </Button>
      </div>

      {/* Price Alert Button */}
      <Button
        variant="outline"
        className={cn(
          "w-full h-11",
          hasPriceAlert && "border-primary/50 bg-primary/5 text-primary"
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
        <Bell className={cn("h-4 w-4 mr-2", hasPriceAlert && "text-primary")} />
        {hasPriceAlert ? "Fiyat Alarmı Aktif" : "Fiyat Düşünce Haber Ver"}
      </Button>

      {/* Delivery Info Box */}
      <DeliveryInfoBox 
        productId={productId}
        dispatchDays={seller?.shipping_speed?.estimated_days ? 1 : 2}
        shippingType={seller?.shipping_speed?.same_day_shipping ? 'same_day' : 'normal'}
        onShowOtherSellers={() => setAddToCartPopupOpen(true)}
        hasFasterSellers={
          sellers?.sellers && sellers.sellers.some(s => 
            s.estimated_delivery_days < (seller?.shipping_speed?.estimated_days || 2)
          )
        }
      />

      {/* Write Review Button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setWriteReviewOpen(true)}
      >
        <Edit3 className="h-4 w-4" />
        Değerlendirme Yaz
      </Button>

      {/* Ask Seller Button */}
      {seller && (
        <Link href="#qa-section">
          <Button variant="outline" className="w-full gap-2">
            <HelpCircle className="h-4 w-4" />
            Satıcıya Sor
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        </Link>
      )}

      {/* Highlights - Öne Çıkanlar */}
      <div>
        <h3 className="font-medium mb-3">Öne Çıkanlar</h3>
        <Button variant="outline" size="sm" className="rounded-full">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          Ürün Özelliklerini Öğren
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Key Features - Trendyol Style Slider */}
      {core.attributes.length > 0 && (
        <div>
          <ProductAttributesSlider attributes={core.attributes} />
        </div>
      )}

      {/* Product Notes */}
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <p>
            Bu ürün{" "}
            {seller ? (
              <Link href={`/store/${seller.slug}`} className="text-primary font-medium hover:underline">
                {seller.name}
              </Link>
            ) : (
              <span className="text-primary font-medium">Satıcı</span>
            )}{" "}
            tarafından gönderilecektir.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <p>Kampanya fiyatından satılmak üzere 100 adetten fazla stok sunulmuştur.</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <p>İncelemiş olduğunuz ürünün satış fiyatını satıcı belirlemektedir.</p>
        </div>
      </div>

      {/* Price Alert Modal */}
      <PriceAlertModal
        productId={productId}
        currentPrice={displayPrice}
        open={priceAlertOpen}
        onOpenChange={setPriceAlertOpen}
      />

      {/* Write Review Modal */}
      <WriteReviewModal
        open={writeReviewOpen}
        onOpenChange={setWriteReviewOpen}
        product={{
          id: productId,
          name: core.title,
          slug: core.slug,
          brand: core.brand.name,
          images: core.images.map(img => ({ id: img.id, url: img.url, alt: core.title, is_primary: img.order === 1 })),
        } as any}
      />

      {/* Add to Cart Popup */}
      <AddToCartPopup
        open={addToCartPopupOpen}
        onOpenChange={setAddToCartPopupOpen}
        product={{
          core,
          pricing,
          engagement,
          seller: seller ?? null,
        }}
        sellers={sellers}
        selectedVariantId={selectedVariantId}
        quantity={quantity}
        onVariantSelect={setSelectedVariantId}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        isAddingToCart={isAddingToCart}
        isAddedToCart={isAddedToCart}
      />
    </div>
  );
}

