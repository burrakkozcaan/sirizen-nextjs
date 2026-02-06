"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Truck, ChevronRight } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

interface OtherSeller {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  follower_count: number;
  is_official: boolean;
  price: number;
  original_price?: number;
  stock: number;
  shipping_speed: {
    estimated_days: number;
    same_day_shipping: boolean;
  };
}

interface PDPOtherSellersProps {
  productId: number;
  currentSellerId: number;
}

// Mock data - will be replaced with API call
const mockOtherSellers: OtherSeller[] = [
  {
    id: 2,
    name: "Moda Dünyası",
    slug: "moda-dunyasi",
    rating: 8.5,
    follower_count: 125000,
    is_official: true,
    price: 899.99,
    original_price: 1299.99,
    stock: 50,
    shipping_speed: {
      estimated_days: 3,
      same_day_shipping: false,
    },
  },
  {
    id: 3,
    name: "Ayakkabı Market",
    slug: "ayakkabi-market",
    rating: 7.8,
    follower_count: 89000,
    is_official: false,
    price: 949.99,
    stock: 25,
    shipping_speed: {
      estimated_days: 2,
      same_day_shipping: true,
    },
  },
];

export function PDPOtherSellers({ productId, currentSellerId }: PDPOtherSellersProps) {
  // Filter out current seller
  const otherSellers = mockOtherSellers.filter((s) => s.id !== currentSellerId);

  if (otherSellers.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  return (
    <div className="mt-6 -mx-4 px-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Diğer Satıcılar</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/product/${productId}/sellers`} className="group">
            Tümünü Gör
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {otherSellers.map((seller) => (
          <Link
            key={seller.id}
            href={`/store/${seller.slug}`}
            className="flex-shrink-0 bg-white border border-[#e6e6e6] rounded-lg p-4 hover:border-primary/50 transition-colors min-w-[200px]"
          >
            <div className="space-y-2">
              {/* Seller Name & Rating */}
              <div className="flex items-center gap-2">
                {seller.logo && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={resolveMediaUrl(seller.logo)}
                      alt={seller.name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{seller.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{Number(seller.rating || 0).toFixed(1)}</span>
                    {seller.is_official && (
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                        Yetkili
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="text-lg font-bold text-primary">
                  {formatPrice(seller.price)}
                </div>
                {seller.original_price && seller.original_price > seller.price && (
                  <div className="text-xs text-muted-foreground line-through">
                    {formatPrice(seller.original_price)}
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="text-xs text-muted-foreground space-y-0.5">
                {seller.shipping_speed.same_day_shipping && (
                  <div className="text-green-600">Bugün kargoda</div>
                )}
                <div>{seller.shipping_speed.estimated_days} günde teslimat</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

