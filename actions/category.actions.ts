"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-server";
import type { Category } from "@/types";

const CATEGORIES_TAG = "categories";

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await apiGet<Category[] | { data: Category[] }>("/categories", {
      next: { tags: [CATEGORIES_TAG], revalidate: 3600 }, // Cache for 1 hour
    });
    // API can return either array directly or wrapped in { data: [...] }
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response = await apiGet<Category | { data: Category }>(`/categories/${slug}`, {
      next: { tags: [CATEGORIES_TAG, `category-${slug}`] },
    });
    // API can return either category directly or wrapped in { data: ... }
    if ('data' in response) {
      return response.data || null;
    }
    return response || null;
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return null;
  }
}

export async function getMainCategories(): Promise<Category[]> {
  try {
    const categories = await apiGet<{ data: Category[] }>("/categories/main", {
      next: { tags: [CATEGORIES_TAG, "main-categories"], revalidate: 3600 },
    });
    return categories.data || [];
  } catch (error) {
    console.error("Error fetching main categories:", error);
    return [];
  }
}

export async function getCategoryProducts(
  slug: string,
  options?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
  }
): Promise<{ data: any[]; meta: any }> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.per_page) params.append("per_page", options.per_page.toString());
    if (options?.sort_by) params.append("sort_by", options.sort_by);

    const queryString = params.toString();
    const endpoint = `/categories/${slug}/products${queryString ? `?${queryString}` : ""}`;

    const response = await apiGet<{ data: any[]; meta: any }>(endpoint, {
      next: { tags: [CATEGORIES_TAG, `category-${slug}-products`], revalidate: 300 },
    });
    return response;
  } catch (error) {
    console.error(`Error fetching products for category ${slug}:`, error);
    return { data: [], meta: {} };
  }
}

