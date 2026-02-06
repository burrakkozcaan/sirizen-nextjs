"use client";

import Link from "next/link";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

interface VendorBanner {
  id: number;
  vendor_id: number;
  vendor_slug: string;
  banner_image: string;
  title?: string;
  link?: string;
}

interface TopVendorBannersProps {
  banners: VendorBanner[];
  className?: string;
}

export function TopVendorBanners({ banners, className }: TopVendorBannersProps) {
  if (!banners || banners.length === 0) return null;

  return (
    <section className={cn("py-6", className)}>
      <div className="container mx-auto px-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => {
            const href = banner.link || `/store/${banner.vendor_slug}`;
            return (
              <div
                key={banner.id}
                className="banner-boutique relative group widget"
                data-testid="banner-boutique"
                data-widgettype="BANNER_BOUTIQUE"
              >
                <Link
                  href={href}
                  className="banner-link block"
                  aria-label={banner.title || `Mağaza ${banner.vendor_id}`}
                >
                  <div className="banner-image-container relative overflow-hidden rounded-lg">
                    <Image
                      src={resolveMediaUrl(banner.banner_image)}
                      alt={banner.title || `Mağaza ${banner.vendor_id}`}
                      width={800}
                      height={328}
                      className="banner-image w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105 cursor-pointer"
                      style={{ aspectRatio: "2.44" }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
