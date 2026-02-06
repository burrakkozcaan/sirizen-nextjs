"use client";

import { useState, useEffect } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { reviewService } from '@/services/review.service';

interface SimpleReviewCardsProps {
  productId: number;
  vendorName?: string;
}

export function SimpleReviewCards({ productId, vendorName }: SimpleReviewCardsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsResponse = await reviewService.getProductReviews(productId, { per_page: 5 });
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">Değerlendirmeler</h2>
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">Değerlendirmeler</h2>
      <div>
        {reviews.map((review: any, idx: number) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
              ))}
              <span className="text-xs text-gray-400 ml-1">
                | {new Date(review.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
            <div className="flex justify-end items-center text-xs text-gray-500">
              <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                <ThumbsUp className="w-4 h-4" /> <span>({review.helpful_count || 0})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

