"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-server";
import type { Vendor } from "@/types";
import { mockVendors } from "@/data/mock-data";

const VENDORS_TAG = "vendors";

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  try {
    const vendor = await apiGet<Vendor>(`/vendors/${slug}`, {
      next: { tags: [VENDORS_TAG, `vendor-${slug}`], revalidate: 60 },
    });
    return vendor;
  } catch (error: any) {
    console.error(`Error fetching vendor ${slug}:`, error);
    // Don't throw, just return null so the page can handle 404
    return null;
  }
}

export async function getVendorById(id: number): Promise<Vendor | null> {
  try {
    const vendor = await apiGet<Vendor>(`/vendors/${id}`, {
      next: { tags: [VENDORS_TAG, `vendor-${id}`] },
    });
    return vendor;
  } catch (error) {
    console.error(`Error fetching vendor ${id}:`, error);
    return null;
  }
}

export async function getVendorProducts(
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
    const endpoint = `/vendors/${slug}/products${queryString ? `?${queryString}` : ""}`;

    const response = await apiGet<{ data: any[]; meta: any }>(endpoint, {
      next: { tags: [VENDORS_TAG, `vendor-${slug}-products`], revalidate: 300 },
    });
    return response;
  } catch (error) {
    console.error(`Error fetching products for vendor ${slug}:`, error);
    return { data: [], meta: {} };
  }
}

export async function getVendorReviews(
  vendorId: number,
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
    const endpoint = `/vendors/${vendorId}/reviews${queryString ? `?${queryString}` : ""}`;

    const response = await apiGet<{ data: any[]; meta: any }>(endpoint, {
      next: { tags: [VENDORS_TAG, `vendor-${vendorId}-reviews`], revalidate: 300 },
    });
    return response;
  } catch (error) {
    console.error(`Error fetching reviews for vendor ${vendorId}:`, error);
    return { data: [], meta: {} };
  }
}

export async function checkVendorFollow(slug: string): Promise<boolean> {
  try {
    const response = await apiGet<{ is_following: boolean }>(
      `/vendors/${slug}/check-follow`,
      {
        next: { tags: [VENDORS_TAG, `vendor-${slug}-follow`], revalidate: 0 },
      }
    );
    return response.is_following || false;
  } catch (error) {
    console.error(`Error checking follow status for vendor ${slug}:`, error);
    return false;
  }
}

export async function followVendor(slug: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiPost<{ message: string; is_following: boolean }>(
      `/vendors/${slug}/follow`
    );
    return { success: true, message: response.message };
  } catch (error: any) {
    console.error(`Error following vendor ${slug}:`, error);
    return { success: false, message: error.message || "Takip edilirken bir hata oluştu" };
  }
}

export async function unfollowVendor(slug: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiDelete<{ message: string; is_following: boolean }>(
      `/vendors/${slug}/follow`
    );
    return { success: true, message: response.message };
  } catch (error: any) {
    console.error(`Error unfollowing vendor ${slug}:`, error);
    return { success: false, message: error.message || "Takipten çıkarılırken bir hata oluştu" };
  }
}

export async function getFollowedVendors(): Promise<Vendor[]> {
  try {
    const response = await apiGet<{ data: Vendor[] }>("/vendors/followed", {
      next: { tags: [VENDORS_TAG, "followed-vendors"], revalidate: 60 },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching followed vendors:", error);
    return [];
  }
}

export async function getFeaturedVendors(limit: number = 12): Promise<Vendor[]> {
  try {
    const response = await apiGet<{ data: Vendor[] }>(
      `/vendors/featured?limit=${limit}`,
      {
        next: { tags: [VENDORS_TAG, "featured-vendors"], revalidate: 300 },
      }
    );
    return response.data || [];
  } catch {
    // Endpoint may not exist yet - silently return empty
    return [];
  }
}

export async function getPopularVendors(limit: number = 12): Promise<Vendor[]> {
  try {
    const response = await apiGet<{ data: Vendor[] }>(
      `/vendors?sort_by=follower_count&sort_order=desc&limit=${limit}`,
      {
        next: { tags: [VENDORS_TAG, "popular-vendors"], revalidate: 300 },
      }
    );
    return response.data || [];
  } catch {
    // Endpoint may not exist yet - silently return empty
    return [];
  }
}

export interface VendorBanner {
  id: number;
  vendor_id: number;
  vendor_slug: string;
  banner_image: string;
  title?: string;
  link?: string;
  display_order?: number;
}

export async function getTopVendorBanners(limit: number = 6): Promise<VendorBanner[]> {
  try {
    const response = await apiGet<{ data: VendorBanner[] }>(
      `/vendors/banners/top?limit=${limit}`,
      {
        next: { tags: [VENDORS_TAG, "top-vendor-banners"], revalidate: 300 },
      }
    );
    if (response.data && response.data.length > 0) {
      return response.data;
    }
  } catch {
    // Endpoint may not exist yet - continue to fallback
  }
  
  // Fallback: Get featured vendors and create banners from them
  try {
    const featuredVendors = await getFeaturedVendors(limit);
    if (featuredVendors && featuredVendors.length > 0) {
      return featuredVendors
        .filter(v => v.banner)
        .slice(0, limit)
        .map((v, index) => ({
          id: v.id,
          vendor_id: v.id,
          vendor_slug: v.slug,
          banner_image: v.banner || "",
          title: v.name,
          display_order: index,
        }));
    }
  } catch {
    // Continue to mock data fallback
  }
  
  // Final fallback: Use mock vendors with banners
  const vendorsWithBanners = mockVendors.filter(v => v.banner);
  if (vendorsWithBanners.length > 0) {
    return vendorsWithBanners
      .slice(0, limit)
      .map((v, index) => ({
        id: v.id,
        vendor_id: v.id,
        vendor_slug: v.slug,
        banner_image: v.banner || "",
        title: v.name,
        display_order: index,
      }));
  }
  
  return [];
}

