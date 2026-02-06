"use client";

import { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  Camera, 
  CheckCircle, 
  ChevronRight,
  Filter,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { reviewService } from '@/services/review.service';
import { cn } from '@/lib/utils';
import type { Review } from '@/types';

interface ProductReviewsProps {
  productId: number;
  onWriteReview?: () => void;
}

type SortType = 'newest' | 'highest' | 'lowest' | 'helpful';

export function ProductReviews({ productId, onWriteReview }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    average: number;
    total: number;
    distribution: Record<number, number>;
  } | null>(null);
  const [filter, setFilter] = useState<{
    rating?: number;
    hasPhotos?: boolean;
    verifiedOnly?: boolean;
  }>({});
  const [sort, setSort] = useState<SortType>('newest');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const [reviewsResponse, statsResponse] = await Promise.allSettled([
          reviewService.getProductReviews(productId, {
            rating: filter.rating,
            has_photos: filter.hasPhotos,
            verified_only: filter.verifiedOnly,
          }),
          reviewService.getProductReviewStats(productId),
        ]);
        
        // Handle reviews response
        if (reviewsResponse.status === 'fulfilled') {
          setReviews(reviewsResponse.value.data);
        } else {
          console.error('Error fetching reviews:', reviewsResponse.reason);
          setReviews([]);
        }
        
        // Handle stats response (optional, can fail)
        if (statsResponse.status === 'fulfilled') {
          setStats(statsResponse.value);
        } else {
          // Stats endpoint might not exist, use default stats
          console.warn('Review stats not available:', statsResponse.reason);
          setStats({
            average: 0,
            total: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
        setStats({
          average: 0,
          total: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId, filter]);

  const handleMarkHelpful = async (reviewId: number) => {
    await reviewService.markHelpful(reviewId);
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
      )
    );
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  if (loading && !stats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      {/* Header with Stats */}
      <div className="p-4 md:p-6 border-b bg-muted/30">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Average Rating */}
          {stats && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-foreground mb-1">
                  {stats.average.toFixed(1)}
                </div>
                <div className="flex justify-center mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= Math.round(stats.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.total.toLocaleString()} Değerlendirme
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.distribution[rating] || 0;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <button
                      key={rating}
                      onClick={() => setFilter({ ...filter, rating: filter.rating === rating ? undefined : rating })}
                      className={cn(
                        'flex items-center gap-2 w-full hover:bg-muted rounded p-1 transition-colors',
                        filter.rating === rating && 'bg-primary/10'
                      )}
                    >
                      <span className="w-3 text-xs font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Write Review Button */}
          <div className="lg:ml-auto flex items-center">
            <Button onClick={onWriteReview} className="gap-2">
              <Star className="h-4 w-4" />
              Değerlendirme Yaz
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filtrele:
          </span>
          <Button
            variant={filter.hasPhotos ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter({ ...filter, hasPhotos: !filter.hasPhotos })}
            className="rounded-full h-8"
          >
            <Camera className="h-3 w-3 mr-1" />
            Fotoğraflı
          </Button>
          <Button
            variant={filter.verifiedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter({ ...filter, verifiedOnly: !filter.verifiedOnly })}
            className="rounded-full h-8"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Satın Alımı Onaylı
          </Button>
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <SortDesc className="h-4 w-4" />
              Sırala:
            </span>
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="text-sm border rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="newest">En Yeni</option>
              <option value="highest">En Yüksek Puan</option>
              <option value="lowest">En Düşük Puan</option>
              <option value="helpful">En Faydalı</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        {displayedReviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Henüz değerlendirme yok</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Bu ürün için henüz değerlendirme yapılmamış. İlk değerlendirmeyi sen yap!
            </p>
            <Button onClick={onWriteReview} size="sm" className="gap-2">
              <Star className="h-4 w-4" />
              Değerlendirme Yaz
            </Button>
          </div>
        ) : (
          displayedReviews.map((review, index) => (
            <div
              key={review.id}
              className={cn(
                'p-4 md:p-5',
                index !== displayedReviews.length - 1 && 'border-b'
              )}
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                {review.user_avatar ? (
                  <img
                    src={review.user_avatar}
                    alt={review.user_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {review.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* User Info & Rating */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.user_name}</span>
                    {review.is_verified_purchase && (
                      <Badge variant="secondary" className="text-xs gap-1 h-5">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Satın Aldı
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-4 w-4',
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>

                  {/* Title */}
                  {review.title && (
                    <h4 className="font-semibold mb-1">{review.title}</h4>
                  )}

                  {/* Comment */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((image) => (
                        <img
                          key={image.id}
                          src={image.url}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id)}
                      className="text-muted-foreground h-8 px-2"
                    >
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                      Faydalı ({review.helpful_count})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show More */}
      {reviews.length > 5 && (
        <div className="p-4 border-t bg-muted/30">
          <Button
            variant="ghost"
            onClick={() => setShowAll(!showAll)}
            className="w-full text-primary hover:text-primary"
          >
            {showAll ? 'Daha Az Göster' : `Tüm Değerlendirmeleri Gör (${reviews.length})`}
            <ChevronRight className={cn('h-4 w-4 ml-1 transition-transform', showAll && 'rotate-90')} />
          </Button>
        </div>
      )}
    </div>
  );
}
