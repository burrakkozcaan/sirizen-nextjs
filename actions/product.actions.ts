"use server";

import { apiGet } from "@/lib/api-server";
import type { Product } from "@/types";
import { allProducts } from "@/data/mock-data";

const PRODUCTS_TAG = "products";

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const response = await apiGet<{ data: Product } | Product>(
      `/products/${id}`,
      {
        next: { tags: [PRODUCTS_TAG, `product-${id}`] },
      }
    );
    // Handle both { data: Product } and Product formats
    const product = (response as any)?.data || response;
    return product as Product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  try {
    // If API supports batch request, use it. Otherwise, fetch individually
    const products = await Promise.all(
      ids.map((id) => getProductById(id))
    );
    return products.filter((p): p is Product => p !== null);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductsByVendor(
  vendorIdOrSlug: number | string,
  options?: { page?: number; per_page?: number }
): Promise<{ data: Product[]; meta: any }> {
  try {
    const page = options?.page || 1;
    const perPage = options?.per_page || 24;
    const products = await apiGet<{ data: Product[]; meta: any }>(
      `/vendors/${vendorIdOrSlug}/products?page=${page}&per_page=${perPage}`,
      {
        next: { tags: [PRODUCTS_TAG, `vendor-${vendorIdOrSlug}-products`] },
      }
    );
    // Handle paginated response
    if (products.data && Array.isArray(products.data)) {
      return products;
    }
    // If response is paginated Laravel format
    if (Array.isArray(products.data)) {
      return products;
    }
    return { data: [], meta: {} };
  } catch (error) {
    console.error(`Error fetching products for vendor ${vendorIdOrSlug}:`, error);
    return { data: [], meta: {} };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await apiGet<Product>(`/products/${slug}`, {
      next: { tags: [PRODUCTS_TAG, `product-${slug}`] },
    });
    return product;
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}

export async function getSimilarProducts(
  productId: number,
  limit: number = 12
): Promise<Product[]> {
  try {
    const response = await apiGet<{ data: Product[] }>(
      `/products/${productId}/similar?limit=${limit}`,
      {
        next: { tags: [PRODUCTS_TAG, `product-${productId}-similar`], revalidate: 300 },
      }
    );
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching similar products for ${productId}:`, error);
    return [];
  }
}

export async function getRelatedProducts(
  productId: number,
  type: "cross" | "up" | "also_bought" = "cross",
  limit: number = 12
): Promise<Product[]> {
  try {
    const response = await apiGet<{ data: Product[] }>(
      `/products/${productId}/related?type=${type}&limit=${limit}`,
      {
        next: { tags: [PRODUCTS_TAG, `product-${productId}-related-${type}`], revalidate: 300 },
      }
    );
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    return [];
  }
}

export async function getProductsByCategory(
  categorySlug: string,
  filters?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    brand?: string[];
    min_price?: number;
    max_price?: number;
    has_free_shipping?: boolean;
    is_in_stock?: boolean;
    rating?: number;
  }
): Promise<{ data: Product[]; meta: { total: number; last_page: number; current_page: number } }> {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.per_page) params.append("per_page", filters.per_page.toString());
    if (filters?.sort_by) params.append("sort_by", filters.sort_by);
    if (filters?.brand && filters.brand.length > 0) {
      filters.brand.forEach((b) => params.append("brand[]", b));
    }
    if (filters?.min_price) params.append("min_price", filters.min_price.toString());
    if (filters?.max_price) params.append("max_price", filters.max_price.toString());
    if (filters?.has_free_shipping) params.append("free_shipping", "true");
    if (filters?.is_in_stock) params.append("in_stock", "true");
    if (filters?.rating) params.append("rating", filters.rating.toString());

    const queryString = params.toString();
    const endpoint = `/categories/${categorySlug}/products${queryString ? `?${queryString}` : ""}`;
    
    const response = await apiGet<{
      data: Product[];
      meta: { total: number; last_page: number; current_page: number };
    }>(endpoint, {
      next: { tags: [PRODUCTS_TAG, `category-${categorySlug}-products`] },
    });
    
    return response;
  } catch (error) {
    console.error(`Error fetching products for category ${categorySlug}:`, error);
    return { data: [], meta: { total: 0, last_page: 1, current_page: 1 } };
  }
}

export async function getBestsellers(limit: number = 12): Promise<Product[]> {
  try {
    const response = await apiGet<{ data: Product[] } | Product[]>(
      `/products/bestsellers?limit=${limit}`,
      {
        next: { tags: [PRODUCTS_TAG, "bestsellers"], revalidate: 300 }, // Cache for 5 minutes
      }
    );
    // Handle both { data: [...] } and [...] formats
    let products: Product[] = [];
    if (Array.isArray(response)) {
      products = response;
    } else {
      products = response.data || [];
    }
    
    // If API returns empty, use seed data
    if (products.length === 0) {
      console.log("Bestsellers API returned empty, using seed data");
      return allProducts
        .filter(p => p.is_bestseller)
        .sort((a, b) => b.review_count - a.review_count)
        .slice(0, limit);
    }
    
    return products;
  } catch (error) {
    console.error("Error fetching bestsellers:", error);
    // Fallback: try to get products sorted by review_count
    try {
      const fallback = await apiGet<{ data: Product[] }>(
        `/products?sort_by=bestseller&per_page=${limit}`,
        {
          next: { tags: [PRODUCTS_TAG, "bestsellers-fallback"], revalidate: 300 },
        }
      );
      const fallbackProducts = fallback.data || [];
      
      // If fallback also empty, use seed data
      if (fallbackProducts.length === 0) {
        console.log("Bestsellers fallback returned empty, using seed data");
        return allProducts
          .filter(p => p.is_bestseller)
          .sort((a, b) => b.review_count - a.review_count)
          .slice(0, limit);
      }
      
      return fallbackProducts;
    } catch (fallbackError) {
      console.error("Error fetching bestsellers fallback:", fallbackError);
      console.log("Using seed data for bestsellers");
      // Final fallback: use seed data
      return allProducts
        .filter(p => p.is_bestseller)
        .sort((a, b) => b.review_count - a.review_count)
        .slice(0, limit);
    }
  }
}

export async function getNewArrivals(limit: number = 12): Promise<Product[]> {
  try {
    const response = await apiGet<{ data: Product[] } | Product[]>(
      `/products/new-arrivals?limit=${limit}`,
      {
        next: { tags: [PRODUCTS_TAG, "new-arrivals"], revalidate: 300 }, // Cache for 5 minutes
      }
    );
    // Handle both { data: [...] } and [...] formats
    let products: Product[] = [];
    if (Array.isArray(response)) {
      products = response;
    } else {
      products = response.data || [];
    }
    
    // If API returns empty, use seed data
    if (products.length === 0) {
      console.log("New arrivals API returned empty, using seed data");
      return allProducts
        .filter(p => p.is_new)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    }
    
    return products;
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    // Fallback: try to get products sorted by newest
    try {
      const fallback = await apiGet<{ data: Product[] }>(
        `/products?sort_by=newest&per_page=${limit}`,
        {
          next: { tags: [PRODUCTS_TAG, "new-arrivals-fallback"], revalidate: 300 },
        }
      );
      const fallbackProducts = fallback.data || [];
      
      // If fallback also empty, use seed data
      if (fallbackProducts.length === 0) {
        console.log("New arrivals fallback returned empty, using seed data");
        return allProducts
          .filter(p => p.is_new)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit);
      }
      
      return fallbackProducts;
    } catch (fallbackError) {
      console.error("Error fetching new arrivals fallback:", fallbackError);
      console.log("Using seed data for new arrivals");
      // Final fallback: use seed data
      return allProducts
        .filter(p => p.is_new)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    }
  }
}

export async function getBuyMoreSaveMore(limit: number = 12): Promise<Product[]> {
  try {
    const response = await apiGet<{ data: Product[] } | Product[]>(
      `/products/buy-more-save-more?limit=${limit}`,
      {
        next: { tags: [PRODUCTS_TAG, "buy-more-save-more"], revalidate: 300 }, // Cache for 5 minutes
      }
    );
    let products: Product[] = [];
    if (Array.isArray(response)) {
      products = response;
    } else {
      products = response.data || [];
    }
    
    // If API returns empty, use seed data (products with high discount)
    if (products.length === 0) {
      console.log("Buy more save more API returned empty, using seed data");
      return allProducts
        .filter(p => p.discount_percentage && p.discount_percentage >= 30)
        .sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
        .slice(0, limit);
    }
    
    return products;
  } catch (error) {
    console.error("Error fetching buy more save more:", error);
    console.log("Using seed data for buy more save more");
    // Fallback: use seed data
    return allProducts
      .filter(p => p.discount_percentage && p.discount_percentage >= 30)
      .sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
      .slice(0, limit);
  }
}

export async function getRecommended(limit: number = 12): Promise<Product[]> {
  try {
    const products = await apiGet<{ data: Product[] }>(
      `/products/recommended?limit=${limit}`,
      {
        next: { tags: [PRODUCTS_TAG, "recommended"], revalidate: 300 }, // Cache for 5 minutes
      }
    );
    return products.data || [];
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return [];
  }
}

export async function getFlashSales(limit: number = 8): Promise<Product[]> {
  try {
    const products = await apiGet<{ data: Product[] }>(
      `/products/flash-sales?limit=${limit}`,
      {
        next: { tags: [PRODUCTS_TAG, "flash-sales"], revalidate: 60 }, // Cache for 1 minute (flash sales change frequently)
      }
    );
    return products.data || [];
  } catch (error) {
    console.error("Error fetching flash sales:", error);
    return [];
  }
}

