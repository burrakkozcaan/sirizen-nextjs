"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Campaign } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media";

interface HeroCarouselProps {
  campaigns: Campaign[];
}

export function HeroCarousel({ campaigns }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // No mock fallback: if API returns nothing, show a neutral placeholder.
  if (!campaigns || campaigns.length === 0) {
    return (
      <section className="mb-4 px-2 md:px-4 pt-2">
        <div className="relative aspect-[2.5/1] md:aspect-[3/1] overflow-hidden rounded-lg md:rounded-xl">
          <Skeleton className="absolute inset-0" />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-4 px-2 md:px-4 pt-2 gap-2">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{ loop: true, align: "start" }}
      >
        <CarouselContent className="-ml-0 gap-2 md:gap-2">
          {campaigns.map((campaign, index) => {
            const src = resolveMediaUrl(campaign.banner || campaign.image);
            return (
              <CarouselItem key={campaign.id} className="pl-0 basis-full">
                <Link href={`/campaign/${campaign.slug}`} className="block">
                  <div className="relative aspect-[2.5/1] md:aspect-[3/1] overflow-hidden rounded-lg md:rounded-xl">
                    {src ? (
                      <Image
                        src={src}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={index === 0}
                      />
                    ) : (
                      <Skeleton className="absolute inset-0" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center">
                      <div className="container mx-auto px-4">
                        <div className="max-w-lg text-white">
                          <h2 className="text-2xl md:text-4xl font-bold mb-2">
                            {campaign.title}
                          </h2>
                          {campaign.discount_percentage && (
                            <p className="text-xl md:text-2xl font-semibold text-primary">
                              %{campaign.discount_percentage}&apos;e varan
                              indirim
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Indicator Dots - Bottom Right */}
                    {campaigns.length > 1 && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                        {campaigns.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.preventDefault();
                              api?.scrollTo(index);
                            }}
                            className={cn(
                              "transition-all duration-300 rounded-full",
                              current === index
                                ? "w-1.5 h-1.5 bg-white"
                                : "w-1 h-1 bg-white/50 hover:bg-white/75"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {campaigns.length > 1 && (
          <>
            <CarouselPrevious className="left-4 hidden md:flex" />
            <CarouselNext className="right-4 hidden md:flex" />
          </>
        )}
      </Carousel>
    </section>
  );
}
