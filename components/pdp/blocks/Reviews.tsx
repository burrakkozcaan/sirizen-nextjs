'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { pdpApi } from '@/services/pdpApi';
import type { Product } from '@/types/pdp';

interface Review {
  id: number;
  rating: number;
  comment: string;
  user: { name: string };
  created_at: string;
}

interface ReviewsProps {
  product: Product;
}

export function Reviews({ product }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await pdpApi.getReviews(product.slug, 1);
        if (response.success) {
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [product.slug]);

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-xl bg-gray-200" />;
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Değerlendirmeler</h2>
        <p className="mt-4 text-gray-500">Henüz değerlendirme yapılmamış.</p>
      </div>
    );
  }

  return (
    <div id="reviews" className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Değerlendirmeler ({product.reviews_count})
      </h2>
      
      <div className="mt-6 space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">{review.user.name}</span>
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <p className="mt-2 text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
