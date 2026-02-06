"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-server";

const BRANDS_TAG = "brands";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  product_count?: number;
}

export async function getAllBrands(): Promise<Brand[]> {
  try {
    const response = await apiGet<{ data: Brand[] }>("/brands", {
      next: { tags: [BRANDS_TAG], revalidate: 3600 },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const response = await apiGet<{ data: Brand }>(`/brands/${slug}`, {
      next: { tags: [BRANDS_TAG, `brand-${slug}`] },
    });
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching brand ${slug}:`, error);
    return null;
  }
}

export async function getBrandProducts(
  slug: string,
  options?: {
    page?: number;
    per_page?: number;
  }
): Promise<{ data: any[]; meta: any }> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.per_page) params.append("per_page", options.per_page.toString());

    const queryString = params.toString();
    const endpoint = `/brands/${slug}/products${queryString ? `?${queryString}` : ""}`;

    const response = await apiGet<{ data: any[]; meta: any }>(endpoint, {
      next: { tags: [BRANDS_TAG, `brand-${slug}-products`], revalidate: 300 },
    });
    return response;
  } catch (error) {
    console.error(`Error fetching products for brand ${slug}:`, error);
    return { data: [], meta: {} };
  }
}

