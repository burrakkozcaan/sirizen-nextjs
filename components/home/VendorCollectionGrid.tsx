"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { VendorCollection } from "@/types";

interface VendorCollectionGridProps {
  collections: VendorCollection[];
  columns?: 1 | 2;
  className?: string;
}

export function VendorCollectionGrid({
  collections,
  columns = 2,
  className,
}: VendorCollectionGridProps) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className={cn("py-4", className)}>
      <div className="container mx-auto px-1">
        <div
          className={cn(
            "grid gap-3",
            columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          )}
        >
          {collections.map((collection) => (
            <VendorCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface VendorCollectionCardProps {
  collection: VendorCollection;
}

function VendorCollectionCard({ collection }: VendorCollectionCardProps) {
  const vendorLink = `/store/${collection.vendor.slug}${
    collection.id ? `?collection=${collection.id}` : ""
  }`;

  // Format date range
  const dateText =
    collection.date ||
    (collection.start_date && collection.end_date
      ? `${formatDate(collection.start_date)} - ${formatDate(collection.end_date)}`
      : "");

  // Get first 2 products for left side images
  const displayProducts = collection.products?.slice(0, 2) || [];

  return (
    <Link
      href={vendorLink}
      className="block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex h-[140px] sm:h-[160px]">
        {/* Left Side - 2 Product Images (side by side) */}
        <div className="w-[45%] flex border-r border-gray-100">
          {displayProducts.map((product, index) => {
            const imageUrl = product.image
              ? resolveMediaUrl(product.image)
              : null;
            return (
              <div
                key={`${collection.id}-${product.id || index}-${index}`}
                className={cn(
                  "flex-1 overflow-hidden bg-gray-50 relative",
                  index === 0 ? "border-r border-gray-100" : ""
                )}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name || `Ürün ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 22vw, 12vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-100">
                    {product.name || "Ürün"}
                  </div>
                )}
              </div>
            );
          })}
          {/* Fill empty slot if only 1 product */}
          {displayProducts.length === 1 && <div className="flex-1 bg-gray-50" />}
          {/* Fill both slots if no products */}
          {displayProducts.length === 0 && (
            <>
              <div className="flex-1 bg-gray-50 border-r border-gray-100" />
              <div className="flex-1 bg-gray-50" />
            </>
          )}
        </div>

        {/* Right Side - Brand Info, Date, CTA */}
        <div className="w-[55%] flex flex-col p-3 sm:p-4 relative">
          {/* Arrow Icon - Top Right */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Top: Brand Logo & Name */}
          <div className="flex items-center gap-2 mb-2 pr-5">
            {collection.vendor.logo ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                <Image
                  src={resolveMediaUrl(collection.vendor.logo)}
                  alt={collection.vendor.name}
                  fill
                  sizes="40px"
                  className="object-contain p-0.5"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">
                  {collection.vendor.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-tight">
                {collection.vendor.name}
              </h3>
              {collection.title && collection.title !== collection.vendor.name && (
                <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">
                  {collection.title}
                </p>
              )}
            </div>
          </div>

          {/* Middle: Date */}
          {dateText && (
            <p className="text-[10px] sm:text-xs text-gray-500">{dateText}</p>
          )}

          {/* Badge + Discount + Product Count */}
          <div className="flex-1 flex flex-col justify-center gap-1 my-1">
            {/* Badge */}
            {collection.badge && (
              <span className="inline-flex self-start px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-orange-100 text-orange-700 rounded">
                {collection.badge}
              </span>
            )}
            {/* Discount */}
            {collection.discount_text && (
              <p className="text-xs sm:text-sm font-bold text-red-600">
                {collection.discount_text}
              </p>
            )}
            {/* Product Count */}
            {collection.product_count && collection.product_count > 0 && (
              <p className="text-[10px] sm:text-xs text-gray-500">
                {collection.product_count}+ ürün
              </p>
            )}
          </div>

          {/* Bottom: CTA */}
          {collection.cta && (
            <div className="pt-1 border-gray/30">
              <p className="text-xs sm:text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors leading-snug line-clamp-2">
                {collection.cta}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("tr-TR", { month: "long" });
    return `${day} ${month}`;
  } catch {
    return dateString;
  }
}
