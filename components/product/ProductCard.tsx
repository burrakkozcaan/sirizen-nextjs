"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Heart,
  Star,
  Truck,
  Eye,
  Zap,
  TrendingUp,
  Clock,
  Award,
  Camera,
  BadgeCheck,
} from "lucide-react";
import type { Product, Badge, SocialProof } from "@/types";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { QuickViewModal } from "./QuickViewModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/media";

interface ProductCardProps {
  product: Product;
  className?: string;
}

// Social proof emoji mapping
const SOCIAL_PROOF_CONFIG: Record<
  string,
  { emoji: string; template: (count: string, period?: string) => string }
> = {
  basket: {
    emoji: "🚀",
    template: (count, period) =>
      period ? `${period} ${count} kişi ekledi!` : `${count} kişi sepete ekledi!`,
  },
  favorite: {
    emoji: "🧡",
    template: (count) => `${count} kişi favoriledi!`,
  },
  view: {
    emoji: "👀",
    template: (count, period) =>
      period ? `${period} ${count} kişi inceledi!` : `${count} kişi inceledi!`,
  },
  sold: {
    emoji: "🔥",
    template: (count, period) =>
      period ? `${period} ${count} adet satıldı!` : `${count} adet satıldı!`,
  },
};

// Format large numbers (1000 -> 1B, 1000000 -> 1M)
function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(".0", "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(".0", "") + "B";
  }
  return count.toString();
}

// Badge ikonlarını belirle
const getBadgeIcon = (key: string) => {
  switch (key) {
    case "fast_delivery":
      return <Zap className="w-3 h-3" />;
    case "advantage":
      return <Award className="w-3 h-3" />;
    case "best_seller":
    case "bestseller":
      return <TrendingUp className="w-3 h-3" />;
    case "flash":
      return <Clock className="w-3 h-3" />;
    default:
      return null;
  }
};

// Badge renklerini belirle
const getBadgeStyles = (badge: Badge) => {
  if (badge.bg_color && badge.text_color) {
    return {
      backgroundColor: badge.bg_color,
      color: badge.text_color,
    };
  }

  switch (badge.color) {
    case "green":
      return "bg-green-500 text-white";
    case "orange":
      return "bg-orange-500 text-white";
    case "red":
      return "bg-red-500 text-white";
    case "blue":
      return "bg-blue-500 text-white";
    case "purple":
      return "bg-purple-500 text-white";
    case "yellow":
      return "bg-yellow-400 text-gray-900";
    default:
      return "bg-gray-500 text-white";
  }
};

// Social Proof Component with rotation animation
function SocialProofBadge({ items }: { items: SocialProof[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  return (
    <div className="h-3 overflow-hidden relative">
      <div
        className="flex flex-col transition-transform duration-300"
        style={{ transform: `translateY(-${currentIndex * 12}px)` }}
      >
        {items.map((item, index) => {
          const config = SOCIAL_PROOF_CONFIG[item.type];
          if (!config) return null;

          return (
            <div
              key={`${item.type}-${index}`}
              className="flex items-center gap-1 h-3 text-[10px] font-semibold text-gray-700"
            >
              <span>{config.emoji}</span>
              <span>{config.template(formatCount(item.count), item.period)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Price Badge Component - Trendyol style with rotation
function PriceBadgesRotating({
  badges,
}: {
  badges: { label: string; type: string }[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (badges.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % badges.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [badges.length]);

  if (!badges || badges.length === 0) return null;

  const getTextColor = (type: string) => {
    switch (type) {
      case "lowest_price":
        return "text-green-600";
      case "flash_sale":
        return "text-red-600";
      case "limited_stock":
        return "text-orange-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="h-3 overflow-hidden relative">
      <div
        className="flex flex-col transition-transform duration-300"
        style={{ transform: `translateY(-${currentIndex * 12}px)` }}
      >
        {badges.map((badge, index) => (
          <p
            key={index}
            className={cn(
              "text-[10px] font-medium truncate h-3 leading-3",
              getTextColor(badge.type)
            )}
          >
            {badge.label}
          </p>
        ))}
      </div>
    </div>
  );
}

// Simple Price Badge Component
function PriceBadgeComponent({
  label,
  type,
}: {
  label: string;
  type: string;
}) {
  const textColor =
    type === "lowest_price"
      ? "text-green-600"
      : type === "flash_sale"
      ? "text-red-600"
      : type === "limited_stock"
      ? "text-orange-600"
      : "text-blue-600";

  return (
    <p className={cn("text-[10px] font-medium truncate", textColor)}>
      {label}
    </p>
  );
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(product.id);

  const images = product.images || [];
  const displayImages = images.slice(0, 5);

  // Touch handlers for image swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentImageIndex < displayImages.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      } else if (diff < 0 && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      }
    }
    setTouchStart(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuickViewOpen(true);
  };

  // Generate social proof from product data or use provided
  const socialProofItems: SocialProof[] = product.social_proof || [];

  // If no social_proof provided, generate from available data
  if (socialProofItems.length === 0) {
    if (product.basket_count && product.basket_count > 10) {
      socialProofItems.push({
        type: "basket",
        emoji: "🚀",
        count: product.basket_count,
        period: "3 günde",
      });
    }
    if (product.favorite_count && product.favorite_count > 50) {
      socialProofItems.push({
        type: "favorite",
        emoji: "🧡",
        count: product.favorite_count,
      });
    }
    if (product.view_count && product.view_count > 100) {
      socialProofItems.push({
        type: "view",
        emoji: "👀",
        count: product.view_count,
        period: "24 saatte",
      });
    }
  }

  // Backend'den gelen PDP Engine badge'leri
  const pdpBadges = product.badges || [];

  const rating = typeof product.rating === "number" ? product.rating : Number(product.rating || 0);
  const brandName = typeof product.brand === "string" ? product.brand : product.brand?.name || "";
  // Check if vendor is official seller (Trendyol verified badge)
  const isOfficial = product.vendor?.is_official || (typeof product.brand === "object" && product.brand?.logo);

  return (
    <>
      <div
        className={cn(
          "group relative bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col",
          className
        )}
      >
        <Link href={`/product/${product.slug}`} className="flex flex-col flex-1">
          {/* Image Section */}
          <div
            className="relative aspect-[2/3] overflow-hidden bg-gray-50"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image Slider */}
            <div className="relative w-full h-full">
              {displayImages.length > 0 ? (
                <img
                  src={resolveMediaUrl(displayImages[currentImageIndex]?.url) || ""}
                  alt={product.title || product.name || "Product"}
                  className="w-full h-full object-cover transition-opacity duration-200"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Image Overlay - Top */}
            <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start">
              {/* Left: Stamp & PDP Badges */}
              <div className="flex flex-col gap-1">
                {/* Stamp Image */}
                {product.stamp_image && (
                  <img
                    src={resolveMediaUrl(product.stamp_image)}
                    alt="Damga"
                    className="w-10 h-auto"
                  />
                )}

                {/* PDP Engine Badges */}
                {pdpBadges.slice(0, 2).map((badge, index) => (
                  <div
                    key={`${badge.key}-${index}`}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-sm",
                      typeof getBadgeStyles(badge) === "string"
                        ? getBadgeStyles(badge)
                        : ""
                    )}
                    style={
                      typeof getBadgeStyles(badge) === "object"
                        ? (getBadgeStyles(badge) as React.CSSProperties)
                        : undefined
                    }
                  >
                    {getBadgeIcon(badge.key)}
                    {badge.label}
                  </div>
                ))}

                {/* Fallback badges if no PDP badges */}
                {pdpBadges.length === 0 && (
                  <>
                    {!!product.is_bestseller && (
                      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Çok Satan
                      </div>
                    )}
                    {!!product.is_new && (
                      <div className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                        Yeni
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-col gap-1">
                <button
                  className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(product);
                  }}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isFav ? "fill-red-500 text-red-500" : "text-gray-500"
                    )}
                  />
                </button>
                {/* Quick View - Eye icon below favorite */}
                <button
                  className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickView(e);
                  }}
                  title="Hızlı Bakış"
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Image Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-col gap-1">
              {/* Image Indicator Dots */}
              {displayImages.length > 1 && (
                <div className="flex justify-center gap-1 mb-1">
                  {displayImages.slice(0, 5).map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentImageIndex(index);
                      }}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        index === currentImageIndex
                          ? "bg-white w-3"
                          : "bg-white/50 hover:bg-white/70"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Hierarchical Badge */}
              {product.hierarchical_badge && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-white"
                  style={{
                    background: "linear-gradient(90deg, #F27A1A 0%, #FFC000 100%)",
                  }}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {product.hierarchical_badge.label} {product.hierarchical_badge.rank}. Ürün
                  </span>
                </div>
              )}

              {/* Free Shipping Badge */}
              {product.has_free_shipping && !product.hierarchical_badge && (
                <div className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                  <Truck className="w-3 h-3" />
                  <span className="font-semibold">Kargo Bedava</span>
                </div>
              )}
            </div>

          </div>

          {/* Info Section - Trendyol Style */}
          <div className="flex-1 flex flex-col p-2.5 gap-1">
            {/* Title: Brand + Product Name (same line) */}
            <h2 className="text-xs leading-tight">
              <span className="font-bold text-gray-900">{brandName}</span>
              {isOfficial && (
                <img
                  src="/icons/verified-seller.svg"
                  alt="Resmi satıcı"
                  className="inline-block w-3 h-3 ml-0.5 align-middle"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-gray-600 ml-1">
                {product.title || product.name || ""}
              </span>
            </h2>

            {/* Social Proof - Between title and rating */}
            {socialProofItems.length > 0 && (
              <SocialProofBadge items={socialProofItems} />
            )}

            {/* Rating Row: Score + Stars + Count + Camera */}
            <div className="flex items-center gap-1 min-h-[12px]">
              <span className="text-[10px] font-semibold text-gray-900">
                {rating.toFixed(1)}
              </span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => {
                  const fillPercent = Math.min(100, Math.max(0, (rating - (i - 1)) * 100));
                  return (
                    <div key={i} className="relative w-2.5 h-2.5">
                      <Star className="w-2.5 h-2.5 fill-gray-200 text-gray-200 absolute" />
                      <div
                        className="overflow-hidden absolute"
                        style={{ width: `${fillPercent}%` }}
                      >
                        <Star className="w-2.5 h-2.5 fill-orange-400 text-orange-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-gray-500">
                ({product.review_count || 0})
              </span>
              {product.has_review_photos && (
                <Camera className="w-3 h-3 text-gray-400 ml-0.5" />
              )}
            </div>

            {/* Price Badges - Rotating (above price) */}
            {(product.price_badges && product.price_badges.length > 0) ? (
              <PriceBadgesRotating badges={product.price_badges} />
            ) : product.price_badge ? (
              <div className="h-3">
                <PriceBadgeComponent
                  label={product.price_badge.label}
                  type={product.price_badge.type}
                />
              </div>
            ) : null}

            {/* Price Row: Discount Badge + Sale Price + Strikethrough */}
            <div className="flex items-center gap-1.5 mt-auto flex-wrap">
              {product.discount_percentage > 0 && (
                <div className="bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded">
                  -{product.discount_percentage}%
                </div>
              )}
              <span className="text-sm font-bold text-orange-500">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-[10px] text-gray-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}
