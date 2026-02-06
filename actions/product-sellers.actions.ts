"use server";

import { apiGet } from "@/lib/api-server";

export interface ProductSeller {
  id: number;
  product_id: number;
  variant_id: number | null;
  vendor_id: number;
  vendor: {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    rating: number;
    review_count: number;
    follower_count: number;
    is_official: boolean;
  };
  price: number;
  original_price?: number;
  stock: number;
  shipping_cost: number;
  shipping_time: string;
  estimated_delivery_days: number;
  is_buybox_winner: boolean;
  badges: Array<{
    type: string;
    label: string;
    icon?: string;
  }>;
  features: Array<{
    type: string;
    label: string;
    icon?: string;
  }>;
}

export interface ProductSellersResponse {
  product_id: number;
  variant_id: number | null;
  sellers: ProductSeller[];
  buybox_winner: ProductSeller | null;
}

/**
 * Get all sellers for a product (BuyBox system)
 * @param productId Product ID
 * @param variantId Optional variant ID to filter sellers
 */
export async function getProductSellers(
  productId: number,
  variantId?: number | null
): Promise<ProductSellersResponse | null> {
  try {
    const params = variantId ? `?variant_id=${variantId}` : "";
    const response = await apiGet<{ data: ProductSellersResponse }>(
      `/products/${productId}/sellers${params}`,
      {
        next: {
          tags: ["product-sellers", `product-sellers-${productId}`],
          revalidate: 60, // 1 minute cache
        },
      }
    );
    return response.data || null;
  } catch (error) {
    console.error(
      `Error fetching product sellers for product ${productId}:`,
      error
    );
    return null;
  }
}

