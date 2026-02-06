"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-server";
import type { Review } from "@/types";

const REVIEWS_TAG = "reviews";

export async function getProductReviews(
  productId: number,
  options?: {
    page?: number;
    per_page?: number;
  }
): Promise<{ data: Review[]; meta: any }> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.per_page) params.append("per_page", options.per_page.toString());

    const queryString = params.toString();
    const endpoint = `/products/${productId}/reviews${queryString ? `?${queryString}` : ""}`;

    const response = await apiGet<{ data: Review[]; meta: any }>(endpoint, {
      next: { tags: [REVIEWS_TAG, `product-${productId}-reviews`], revalidate: 300 },
    });
    return response;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return { data: [], meta: {} };
  }
}

export async function createReview(
  productId: number,
  data: {
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }
): Promise<{ success: boolean; data?: Review; error?: string }> {
  try {
    const response = await apiPost<{ data: Review }>(`/reviews`, {
      product_id: productId,
      ...data,
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Error creating review for product ${productId}:`, error);
    return { success: false, error: error.message || "Failed to create review" };
  }
}

export async function updateReview(
  reviewId: number,
  data: {
    rating?: number;
    title?: string;
    comment?: string;
  }
): Promise<{ success: boolean; data?: Review; error?: string }> {
  try {
    const response = await apiPut<{ data: Review }>(`/reviews/${reviewId}`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Error updating review ${reviewId}:`, error);
    return { success: false, error: error.message || "Failed to update review" };
  }
}

export async function deleteReview(
  reviewId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiDelete(`/reviews/${reviewId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting review ${reviewId}:`, error);
    return { success: false, error: error.message || "Failed to delete review" };
  }
}

