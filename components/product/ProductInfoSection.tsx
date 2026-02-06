"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  Minus,
  Plus,
  Bell,
  Clock,
  MapPin,
  Zap,
  ChevronRight,
  Calendar,
  Sparkles,
  Edit3,
  Truck,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProductVariant {
  id: number;
  value: string;
  price: number;
  original_price?: number;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  title?: string;
  brand?: string;
  brand_slug?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  rating: number;
  review_count: number;
  question_count: number;
  images: Array<{ id: number; url: string; alt?: string }>;
  variants?: ProductVariant[];
  vendor?: {
    id: number;
    name: string;
    slug: string;
    rating?: number;
  };
  soldCount?: number;
}

interface ProductInfoSectionProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  isFavorite: boolean;
  hasPriceAlert: boolean;
  selectedLocation: { city: string; district: string } | null;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onPriceAlertClick: () => void;
  onLocationClick: () => void;
  onWriteReviewClick: () => void;
  onSizeGuideClick: () => void;
  onShowOtherSellers?: () => void;
  hasFasterSellers?: boolean;
  campaigns?: Array<{
    id: number;
    type: 'coupon' | 'discount' | 'bundle' | 'flash';
    title: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    min_order?: number;
  }>;
  productId?: number;
}

export function ProductInfoSection({
  product,
  selectedVariant,
  onVariantSelect,
  quantity,
  onQuantityChange,
  isFavorite,
  hasPriceAlert,
  selectedLocation,
  onToggleFavorite,
  onAddToCart,
  onPriceAlertClick,
  onLocationClick,
  onWriteReviewClick,
  onSizeGuideClick,
  onShowOtherSellers,
  hasFasterSellers = false,
  campaigns = [],
  productId,
}: ProductInfoSectionProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isClaimingCoupon, setIsClaimingCoupon] = useState(false);
  
  // Find first available coupon
  const availableCoupon = campaigns.find(c => c.type === 'coupon');
  
  const handlePriceAlertClick = () => {
    try {
      if (!isAuthenticated) {
        toast.error("Fiyat alarmı kurmak için lütfen giriş yapın");
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      onPriceAlertClick();
    } catch (error) {
      console.error('Fiyat alarmı modal açılırken hata:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };
  
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error("Koleksiyona eklemek için lütfen giriş yapın");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    onToggleFavorite();
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const currentPrice = selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant?.original_price ?? product.original_price;

  return (
    <div className="space-y-4">
      {/* Brand & Title */}
      <div>
        {product.brand_slug && (
          <Link
            href={`/brand/${product.brand_slug}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {product.brand || product.name}
          </Link>
        )}
        <h1 className="text-lg font-medium text-foreground mt-1 leading-tight">
          {product.title || product.name}
        </h1>
      </div>

      {/* Rating Row */}
      <div className="flex items-center gap-3 flex-wrap text-sm">
        <button
          onClick={onWriteReviewClick}
          className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded hover:bg-yellow-100 transition-colors cursor-pointer"
        >
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">
            {Number(product.rating || 0).toFixed(1)}
          </span>
        </button>
        <Link href="#reviews" className="text-muted-foreground hover:text-primary">
          {(product.review_count || product.reviews_count || 0).toLocaleString('tr-TR')} Değerlendirme
        </Link>
        <span className="text-muted-foreground">|</span>
        <Link href="#qa" className="text-muted-foreground hover:text-primary">
          {product.question_count} Soru-Cevap
        </Link>
      </div>

      {/* Favorites & Popularity */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
          <span className="text-pink-600 font-medium">29B</span>
          <span className="text-muted-foreground">Favori</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span className="text-muted-foreground">Kullanıcılar Beğeniyor!</span>
        </div>
      </div>

      {/* Price */}
      <div className="py-3 border-y">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</span>
          {originalPrice && originalPrice > currentPrice && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
          {product.discount_percentage && (
            <Badge className="bg-primary/10 text-primary">%{product.discount_percentage}</Badge>
          )}
        </div>
      </div>

      {/* Coupon Opportunity - Desktop */}
      {availableCoupon && (
        <div className="hidden md:block mt-4 border border-pink-200 bg-pink-50 rounded-lg p-3 flex items-center justify-between">
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
              
              if (!productId) return;
              
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
      )}

      {/* Mobile Coupon */}
      {availableCoupon && (
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
              
              if (!productId) return;
              
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
      )}

      {/* Sales Proof */}
      <div className="mt-3 text-xs text-gray-600 flex items-center gap-1">
        🚀 <span className="font-bold text-orange-500">3 günde {product.soldCount || 127} ürün</span> satıldı!
      </div>

      {/* Size Variants - Desktop Only */}
      {product.variants && product.variants.length > 0 && (
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Beden:</span>
            <button className="text-sm text-primary hover:underline" onClick={onSizeGuideClick}>Beden Tablosu</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <Button
                key={variant.id}
                variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onVariantSelect(variant)}
                disabled={variant.stock === 0}
                className={cn(
                  'min-w-[48px] h-10',
                  variant.stock === 0 && 'opacity-50 line-through',
                  selectedVariant?.id === variant.id && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                {variant.value}
              </Button>
            ))}
          </div>
          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < 10 && (
            <p className="text-sm text-destructive mt-2 font-medium">
              Son {selectedVariant.stock} ürün kaldı!
            </p>
          )}
        </div>
      )}

      {/* Quantity - Desktop Only */}
      <div className="hidden lg:flex items-center gap-4">
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

      {/* Action Buttons - Desktop Only */}
      <div className="hidden lg:flex gap-2">
        <Button
          size="lg"
          className="flex-1 h-12 bg-primary hover:bg-primary/90 text-lg font-semibold"
          onClick={onAddToCart}
        >
          Sepete Ekle
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleToggleFavorite}
          className={cn(
            'h-12 w-12 p-0',
            isFavorite && 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          )}
        >
          <Heart className={cn('h-5 w-5', isFavorite && 'fill-red-500')} />
        </Button>
      </div>

      {/* Price Alert */}
      <Button
        variant="outline"
        className={cn(
          'w-full h-11',
          hasPriceAlert && 'border-primary/50 bg-primary/5 text-primary'
        )}
        onClick={handlePriceAlertClick}
      >
        <Bell className={cn('h-4 w-4 mr-2', hasPriceAlert && 'text-primary')} />
        {hasPriceAlert ? 'Fiyat Alarmı Aktif' : 'Fiyat Düşünce Haber Ver'}
      </Button>

      {/* Delivery Info */}
      <div className="bg-muted/30 rounded-xl p-4 space-y-3">
        {/* Shipping time */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Tahmini Kargoya Teslim</p>
            <p className="text-sm text-green-600 font-semibold">2 gün içinde kargoda</p>
          </div>
        </div>

        {/* Delivery location */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            {selectedLocation ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">
                    {selectedLocation.district}, {selectedLocation.city}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-primary text-xs"
                    onClick={onLocationClick}
                  >
                    Değiştir
                  </Button>
                </div>
                <p className="text-sm font-medium">Tahmini Teslim:</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-primary font-bold">16 Ocak Cuma</span>
                  <span className="text-green-600 font-medium">kapında!</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Konumunu seç, teslimat tarihini öğren!</p>
                  <p className="text-xs text-muted-foreground">
                    İl ve ilçe seçerek tahmini teslimat tarihini görebilirsiniz
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary shrink-0"
                  onClick={onLocationClick}
                >
                  Konum Seç <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Fast delivery */}
        {hasFasterSellers && onShowOtherSellers && (
          <button 
            onClick={onShowOtherSellers}
            className="flex items-center gap-3 w-full p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-700 flex-1 text-left">
              Daha Hızlı Teslimat yapan satıcı var!
            </span>
            <ChevronRight className="h-4 w-4 text-green-600" />
          </button>
        )}
      </div>

      {/* Write Review Button */}
      <Button variant="outline" className="w-full gap-2" onClick={onWriteReviewClick}>
        <Edit3 className="h-4 w-4" />
        Değerlendirme Yaz
      </Button>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 py-3 border-t">
        <div className="flex flex-col items-center text-center p-2">
          <Truck className="h-5 w-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">Ücretsiz Kargo</span>
        </div>
        <div className="flex flex-col items-center text-center p-2">
          <RotateCcw className="h-5 w-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">15 Gün İade</span>
        </div>
        <div className="flex flex-col items-center text-center p-2">
          <ShieldCheck className="h-5 w-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">Güvenli Alışveriş</span>
        </div>
      </div>

      {/* Key Features Grid */}
      <div>
        <h3 className="font-medium mb-3">Öne Çıkan Özellikler</h3>
        <div className="grid grid-cols-2 gap-px bg-border rounded-lg overflow-hidden">
          {[
            { label: 'Cilt Tipi', value: 'Tüm Cilt Tipleri' },
            { label: 'Kullanma Amacı', value: 'Nemlendirici' },
            { label: 'Ek Özellik', value: 'Alkol İçermeyen' },
            { label: 'İçerik', value: 'E Vitamini' },
          ].map((spec) => (
            <div key={spec.label} className="bg-card p-3">
              <p className="text-xs text-muted-foreground">{spec.label}</p>
              <p className="text-sm font-medium">{spec.value}</p>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-2 text-primary">
          Tüm Özellikleri Gör
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Product Notes */}
      <div className="space-y-2 text-sm border-t pt-4">
        <div className="flex items-start gap-2">
          <span className="text-primary mt-0.5">•</span>
          <p>
            Bu ürün{' '}
            {product.vendor?.slug ? (
              <Link href={`/store/${product.vendor.slug}`} className="text-primary font-medium hover:underline">
                {product.vendor.name}
              </Link>
            ) : (
              <span className="text-primary font-medium">{product.vendor?.name || 'Satıcı'}</span>
            )}{' '}
            tarafından gönderilecektir.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-primary mt-0.5">•</span>
          <p>Kampanya fiyatından satılmak üzere 100 adetten fazla stok sunulmuştur.</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-primary mt-0.5">•</span>
          <p>İncelemiş olduğunuz ürünün satış fiyatını satıcı belirlemektedir.</p>
        </div>
      </div>
    </div>
  );
}

