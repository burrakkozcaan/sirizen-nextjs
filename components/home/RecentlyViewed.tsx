"use client";

import Link from 'next/link';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface RecentlyViewedProps {
  excludeProductId?: number;
  limit?: number;
  showClear?: boolean;
}

export function RecentlyViewed({ excludeProductId, limit = 12, showClear = false }: RecentlyViewedProps) {
  const { items, clearAll } = useRecentlyViewed();
  
  // Filter out the current product if provided
  const products = excludeProductId 
    ? items.filter(p => p.id !== excludeProductId).slice(0, limit)
    : items.slice(0, limit);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Son Gezdiğiniz Ürünler</h2>
          <span className="text-sm text-muted-foreground">({products.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {showClear && products.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Temizle
            </Button>
          )}
          {products.length > 6 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/son-gezilen" className="group">
                Tümünü Gör
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Carousel opts={{ align: 'start', loop: false }} className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem 
              key={product.id} 
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-3 hidden md:flex" />
        <CarouselNext className="-right-3 hidden md:flex" />
      </Carousel>
    </section>
  );
}
