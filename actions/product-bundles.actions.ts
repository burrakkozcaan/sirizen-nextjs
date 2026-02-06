"use server";

import { apiGet } from "@/lib/api-server";
import type { Product } from "@/types";

export interface ProductBundle {
  id: number;
  main_product_id: number;
  title: string;
  bundle_type: "quantity_discount" | "set" | "combo";
  discount_rate: number;
  is_active: boolean;
  products: Product[];
  total_price: number;
  bundle_price: number;
  savings: number;
}

/**
 * Get product bundles for a product
 */
export async function getProductBundles(
  productId: number
): Promise<ProductBundle[]> {
  try {
    const response = await apiGet<{ data: ProductBundle[] }>(
      `/products/${productId}/bundles`,
      {
        next: {
          tags: ["product-bundles", `bundles-product-${productId}`],
          revalidate: 300, // 5 minutes
        },
      }
    );
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching bundles for product ${productId}:`, error);
    return [];
  }
}
