"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Store, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { Vendor } from "@/types";

interface VendorCarouselProps {
  vendors: Vendor[];
  title?: string;
}

export function VendorCarousel({ vendors, title = "Popüler Mağazalar" }: VendorCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = () => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  };

  if (vendors.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {vendors.map((vendor) => (
            <CarouselItem
              key={vendor.id}
              className="pl-3 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <VendorCard vendor={vendor} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link
      href={`/store/${vendor.slug}`}
      className="block group"
    >
      <div className="relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/50">
        {/* Banner Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
          {vendor.banner ? (
            <Image
              src={vendor.banner}
              alt={vendor.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Store className="h-16 w-16 text-primary/30" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Logo */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-2 border-white">
              {vendor.logo ? (
                <Image
                  src={vendor.logo}
                  alt={vendor.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <Store className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg drop-shadow-md">
                {vendor.name}
              </h3>
              {vendor.is_official && (
                <span className="inline-flex items-center text-xs text-white/90 bg-primary/80 px-2 py-0.5 rounded-full">
                  Resmi Mağaza
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{Number(vendor.rating || 0).toFixed(1)}</span>
              <span>({vendor.review_count} değerlendirme)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{formatNumber(vendor.follower_count)} takipçi</span>
            </div>
          </div>

          {vendor.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {vendor.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {vendor.product_count} ürün
            </span>
            <span className="text-sm text-primary font-medium group-hover:underline">
              Mağazaya Git
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
