"use server";

import { apiGet } from "@/lib/api-server";
import type { Collection, VendorCollection } from "@/types";
import { getFeaturedVendors } from "@/actions/vendor.actions";

const COLLECTIONS_TAG = "collections";

/**
 * Get vendor collections for homepage
 * Returns collections formatted for vendor collection grid display
 */
export async function getVendorCollections(limit: number = 6): Promise<VendorCollection[]> {
  try {
    const response = await apiGet<{ data: VendorCollection[] }>(
      `/collections/vendor?limit=${limit}`,
      {
        next: { tags: [COLLECTIONS_TAG, "vendor-collections"], revalidate: 300 },
      }
    );
    if (response.data && response.data.length > 0) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching vendor collections:", error);
  }

  // Fallback: Try to get collections from featured vendors
  try {
    return await getCollectionsFromFeaturedVendors(limit);
  } catch (error) {
    console.error("Error creating collections from featured vendors:", error);
    return [];
  }
}

/**
 * Create vendor collections from featured vendors
 * This is a fallback when the collections API endpoint doesn't exist yet
 */
async function getCollectionsFromFeaturedVendors(limit: number): Promise<VendorCollection[]> {
  const featuredVendors = await getFeaturedVendors(limit);
  
  if (!featuredVendors || featuredVendors.length === 0) {
    return [];
  }

  const collections: VendorCollection[] = [];

  for (const vendor of featuredVendors) {
    try {
      // Try to get vendor products to create a collection
      const productsResponse = await apiGet<{ data: any[] }>(
        `/vendors/${vendor.slug}/products?per_page=4`,
        {
          next: { tags: [COLLECTIONS_TAG, `vendor-${vendor.slug}-products`], revalidate: 300 },
        }
      );

      const products = (productsResponse.data || []).slice(0, 4).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        image: p.images?.[0]?.url || p.image || null,
        name: p.name || p.title || "",
      }));

      if (products.length > 0) {
        collections.push({
          id: vendor.id,
          vendor: {
            id: vendor.id,
            name: vendor.name,
            slug: vendor.slug,
            logo: vendor.logo || undefined,
          },
          title: vendor.name,
          subtitle: `${products.length} ürün`,
          products,
          cta: `${vendor.name} ürünlerini keşfet`,
        });
      }
    } catch (error) {
      console.error(`Error fetching products for vendor ${vendor.slug}:`, error);
      // Continue with next vendor
    }
  }

  return collections.slice(0, limit);
}

/**
 * Get collections by IDs
 */
export async function getCollectionsByIds(ids: number[]): Promise<Collection[]> {
  try {
    const idsParam = ids.join(",");
    const response = await apiGet<{ data: Collection[] }>(
      `/collections?ids=${idsParam}`,
      {
        next: { tags: [COLLECTIONS_TAG], revalidate: 300 },
      }
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching collections by IDs:", error);
    return [];
  }
}

/**
 * Get collection by ID
 */
export async function getCollectionById(id: number): Promise<Collection | null> {
  try {
    const collection = await apiGet<Collection>(`/collections/${id}`, {
      next: { tags: [COLLECTIONS_TAG, `collection-${id}`], revalidate: 300 },
    });
    return collection;
  } catch (error) {
    console.error(`Error fetching collection ${id}:`, error);
    return null;
  }
}

