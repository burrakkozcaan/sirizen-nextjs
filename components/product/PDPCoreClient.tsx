"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { ProductCore, Pricing } from "@/actions/pdp.actions";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/FavoritesContext";

interface PDPCoreClientProps {
  core: ProductCore;
  pricing?: Pricing | null;
}

export function PDPCoreClient({ core, pricing }: PDPCoreClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFav = isFavorite(core.id);

  const handleFavoriteClick = () => {
    const productForFavorite = {
      id: core.id,
      name: core.title,
      slug: core.slug,
      price: pricing?.final_price || 0,
      images: core.images.map((img) => ({
        id: img.id,
        url: img.url,
        is_primary: img.order === 1,
      })),
    } as any;
    toggleFavorite(productForFavorite);
  };

  // Calculate discount percentage from pricing
  const discountPercentage =
    pricing &&
    pricing.original_price &&
    pricing.original_price > pricing.final_price
      ? Math.round(
          ((pricing.original_price - pricing.final_price) /
            pricing.original_price) *
            100
        )
      : 0;

  // Fallback image if no images available
  const images =
    core.images && core.images.length > 0
      ? core.images
      : [
          {
            id: 0,
            url: "https://placehold.co/600x600?text=No+Image",
            order: 0,
          },
        ];

  const selectedImage = images[selectedImageIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-card">
        <Image
          src={resolveMediaUrl(selectedImage.url)}
          alt={`${core.title} - ${selectedImageIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 40vw"
          priority
          unoptimized={selectedImage.url.startsWith("https://placehold.co")}
        />

        {/* Badges Overlay */}
        <div className="absolute top-4 left-0 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="bg-[#16be48] text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-r-md">
            <span className='w-4 h-4 bg-white/20 rounded-full flex items-center justify-center'>⚡</span>
            HIZLI TESLİMAT
          </div>
          <div className="bg-[#e6e6e6] text-black text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-r-md border border-gray-300">
            KUPONLU ÜRÜN
          </div>
          <div className="bg-white rounded-full shadow-md w-16 h-16 flex flex-col items-center justify-center text-center border-2 border-orange-500 absolute top-12 left-2 rotate-[-15deg]">
            <span className="text-[10px] font-bold text-orange-500 leading-tight">EN ÇOK</span>
            <span className="text-xs font-black text-orange-500 leading-tight">SATAN</span>
          </div>
        </div>

        {/* Discount Badge - Top Left */}
        {discountPercentage > 0 && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground z-20">
            %{discountPercentage} İNDİRİM
          </Badge>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
          <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition pointer-events-auto" onClick={handleFavoriteClick}>
            <Heart className={cn('w-5 h-5 text-gray-500', isFav && 'fill-red-500 text-red-500')} />
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                selectedImageIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <Image
                src={resolveMediaUrl(img.url)}
                alt={`${core.title} - Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
