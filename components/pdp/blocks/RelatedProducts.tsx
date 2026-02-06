'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { pdpApi } from '@/services/pdpApi';
import type { ProductListItem } from '@/types/pdp';

interface RelatedProductsProps {
  product: { slug: string };
}

export function RelatedProducts({ product }: RelatedProductsProps) {
  const [related, setRelated] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!product?.slug) {
      setIsLoading(false);
      return;
    }

    const fetchRelated = async () => {
      try {
        const response = await pdpApi.getRelated(product.slug);
        if (response.success) {
          setRelated(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelated();
  }, [product?.slug]);

  if (isLoading) {
    return (
      <div className="py-8">
        <h2 className="mb-4 text-lg font-semibold">Benzer Ürünler</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <div className="py-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Benzer Ürünler</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {related.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.slug}`}
            className="group rounded-xl border border-gray-200 bg-white p-3 transition hover:shadow-lg"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
            </div>
            <div className="mt-3 space-y-1">
              {item.brand && (
                <p className="text-xs font-medium text-orange-600">{item.brand}</p>
              )}
              <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                {item.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {formatPrice(item.discount_price || item.price)}
                </span>
                {item.discount_price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(item.price)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(price);
}
