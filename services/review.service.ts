import type { Review, PaginatedResponse, SellerReview } from '@/types';
import { api } from '@/lib/api';

export const reviewService = {
  /**
   * Get reviews for a product
   */
  async getProductReviews(
    productId: number,
    options: {
      page?: number;
      per_page?: number;
      rating?: number;
      has_photos?: boolean;
      verified_only?: boolean;
      sort?: 'newest' | 'helpful' | 'rating_high' | 'rating_low';
    } = {}
  ): Promise<PaginatedResponse<Review>> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.per_page) params.append('per_page', options.per_page.toString());
      if (options.rating) params.append('rating', options.rating.toString());
      if (options.has_photos) params.append('has_photos', 'true');
      if (options.verified_only) params.append('verified_only', 'true');
      if (options.sort) params.append('sort', options.sort);

      const response = await api.get<{ data: Review[]; meta: any }>(
        `/products/${productId}/reviews?${params.toString()}`
      );

      return {
        data: response.data || [],
        meta: response.meta || {
          current_page: options.page || 1,
          last_page: 1,
          per_page: options.per_page || 10,
          total: response.data?.length || 0,
        },
      };
    } catch (error: any) {
      // Silently handle errors - backend might not have reviews endpoint yet
      // Errors are already handled gracefully by Promise.allSettled in ProductReviews
      return {
        data: [],
        meta: {
          current_page: options.page || 1,
          last_page: 1,
          per_page: options.per_page || 10,
          total: 0,
        },
      };
    }
  },


  /**
   * Get review statistics for a product
   */
  async getProductReviewStats(productId: number): Promise<{
    average: number;
    total: number;
    distribution: Record<number, number>;
  }> {
    try {
      const response = await api.get<{
        average: number;
        total: number;
        distribution: Record<number, number>;
      }>(`/products/${productId}/reviews/stats`);

      return response || {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    } catch (error: any) {
      // Stats endpoint might not exist (404), handle silently
      // Errors are already handled gracefully by Promise.allSettled in ProductReviews
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  },

  /**
   * Get seller reviews
   */
  async getSellerReviews(
    vendorId: number,
    page: number = 1,
    perPage: number = 10
  ): Promise<PaginatedResponse<SellerReview>> {
    try {
      const response = await api.get<{ data: SellerReview[]; meta: any }>(
        `/vendors/${vendorId}/reviews?page=${page}&per_page=${perPage}`
      );

      return {
        data: response.data || [],
        meta: response.meta || {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: response.data?.length || 0,
        },
      };
    } catch (error) {
      console.error(`Error fetching seller reviews for vendor ${vendorId}:`, error);
      return {
        data: [],
        meta: {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: 0,
        },
      };
    }
  },

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: number): Promise<{ success: boolean }> {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      return { success: true };
    } catch (error) {
      console.error(`Error marking review ${reviewId} as helpful:`, error);
      return { success: false };
    }
  },
};
