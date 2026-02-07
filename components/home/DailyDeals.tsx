"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Heart, ShoppingCart, Star, Flame, Zap, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface DailyDealsProps {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  viewAllLink?: string;
}

export function DailyDeals({
  title = "Günün Fırsatları",
  subtitle,
  backgroundColor = "#BE1A1A",
  textColor = "#FFFFFF",
  viewAllLink = "/campaign/daily-deals",
}: DailyDealsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addItem } = useCart();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        // Try to fetch daily deals, fallback to discounted products
        const response = await api
          .get<{ data: Product[] }>("/products?has_discount=true&per_page=20&sort_by=discount_desc")
          .catch(() => ({ data: [] }));

        const deals = response.data || [];
        setProducts(deals.filter(p => p.discount_percentage && p.discount_percentage >= 10).slice(0, 20));
      } catch (error) {
        console.error("Error fetching daily deals:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      toast.success("Favorilerden kaldırıldı");
    } else {
      addFavorite(product);
      toast.success("Favorilere eklendi");
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addItem(product, 1);
      toast.success("Sepete eklendi");
    } catch (error) {
      toast.error("Sepete eklenemedi");
    }
  };

  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0 && product.images[0]?.url) {
      return product.images[0].url;
    }
    return "/placeholder-product.png";
  };

  const getProductName = (product: Product): string => {
    return product.name || product.title || "Ürün";
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="px-4">
        <div
          className="rounded-2xl p-3"
          style={{ backgroundColor }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-6 w-40 bg-white/20 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[160px] h-[280px] bg-white/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="px-4">
      <div
        className="rounded-2xl p-3 relative overflow-hidden"
        style={{ backgroundColor, color: textColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" />
            <h2 className="text-lg font-bold">{title}</h2>
            {subtitle && (
              <span className="text-sm opacity-80">{subtitle}</span>
            )}
          </div>
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <span>Tümünü Gör</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Carousel */}
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="flex-shrink-0 w-[160px] bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                style={{ scrollSnapAlign: "start" }}
              >
                {/* Badges */}
                <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
                  {product.discount_percentage && product.discount_percentage >= 20 && (
                    <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0.5">
                      <Zap className="w-3 h-3 mr-0.5" />
                      Günün Fırsatı
                    </Badge>
                  )}
                  {product.is_bestseller && (
                    <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5">
                      Çok Satan
                    </Badge>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => handleFavoriteToggle(e, product)}
                  className="absolute top-1 right-1 z-10 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      isFavorite(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    )}
                  />
                </button>

                {/* Product Image */}
                <div className="relative aspect-square bg-gray-50">
                  <Image
                    src={getProductImage(product)}
                    alt={getProductName(product)}
                    fill
                    sizes="160px"
                    className="object-contain p-2"
                  />
                </div>

                {/* Product Info */}
                <div className="p-2">
                  <h3 className="text-xs text-gray-800 line-clamp-2 h-8 mb-1">
                    {getProductName(product)}
                  </h3>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] text-gray-600">
                        {Number(product.rating || 0).toFixed(1)}
                      </span>
                      {product.review_count > 0 && (
                        <span className="text-[10px] text-gray-400">
                          ({product.review_count})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="space-y-0.5">
                    {product.original_price && product.original_price > product.price && (
                      <div className="text-[10px] text-gray-400 line-through">
                        {formatPrice(product.original_price)} TL
                      </div>
                    )}
                    {product.discount_percentage && product.discount_percentage > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-green-600" />
                        <span className="text-[10px] font-medium text-green-600">
                          Sepete Özel
                        </span>
                      </div>
                    )}
                    <div className="text-sm font-bold text-primary">
                      {formatPrice(product.price)} TL
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full mt-2 h-7 bg-primary text-white text-xs font-medium rounded flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Sepete Ekle
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
