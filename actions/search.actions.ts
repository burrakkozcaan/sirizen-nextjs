"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-server";
import type { Product, Category, Vendor } from "@/types";

const SEARCH_TAG = "search";

export interface SearchResult {
  products: Product[];
  categories: Category[];
  vendors: Vendor[];
  brands: Array<{ id: number; name: string; slug: string }>;
  total: number;
}

export async function search(
  query: string,
  options?: {
    page?: number;
    per_page?: number;
    category_id?: number;
    min_price?: number;
    max_price?: number;
  }
): Promise<SearchResult> {
  try {
    const params = new URLSearchParams();
    params.append("q", query);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.per_page) params.append("per_page", options.per_page.toString());
    if (options?.category_id) params.append("category_id", options.category_id.toString());
    if (options?.min_price) params.append("min_price", options.min_price.toString());
    if (options?.max_price) params.append("max_price", options.max_price.toString());

    const response = await apiGet<{ data: SearchResult }>(`/search?${params.toString()}`, {
      next: { tags: [SEARCH_TAG, `search-${query}`], revalidate: 60 },
    });
    return response.data || { products: [], categories: [], vendors: [], brands: [], total: 0 };
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return { products: [], categories: [], vendors: [], brands: [], total: 0 };
  }
}

