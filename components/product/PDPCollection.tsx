"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";

interface CollectionItem {
  id: number;
  name: string;
  slug: string;
  image?: string;
  product_count: number;
}

interface PDPCollectionProps {
  productId: number;
  categoryId?: number;
}

// Mock data - will be replaced with API call
const mockCollections: CollectionItem[] = [
  {
    id: 1,
    name: "Kış Botları",
    slug: "kis-botlari",
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400",
    product_count: 245,
  },
  {
    id: 2,
    name: "Kadın Ayakkabı",
    slug: "kadin-ayakkabi",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    product_count: 189,
  },
  {
    id: 3,
    name: "Spor Ayakkabı",
    slug: "spor-ayakkabi",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400",
    product_count: 156,
  },
];

export function PDPCollection({ productId, categoryId }: PDPCollectionProps) {
  if (mockCollections.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 -mx-4 px-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Koleksiyon</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/collections" className="group">
            Tümünü Gör
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {mockCollections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collection/${collection.slug}`}
            className="flex-shrink-0 bg-white border border-[#e6e6e6] rounded-lg p-4 hover:border-primary/50 transition-colors min-w-[180px]"
          >
            <div className="space-y-2">
              {collection.image && (
                <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                  <Image
                    src={resolveMediaUrl(collection.image)}
                    alt={collection.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="180px"
                  />
                </div>
              )}
              <h4 className="font-semibold text-sm">{collection.name}</h4>
              <p className="text-xs text-muted-foreground">
                {collection.product_count} ürün
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

