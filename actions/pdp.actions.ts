"use server";

import { apiGet } from "@/lib/api-server";
import { allProducts } from "@/data/mock-data";
import type { UnifiedPdpResponse, PdpApiParams } from "@/types/unified-pdp";

// ============================================
// UNIFIED PDP API (Trendyol-style)
// ============================================

/**
 * UNIFIED PDP API
 *
 * GET /api/pdp/{slug}?context=page|cart|modal|quickview
 *
 * Frontend ASLA karar vermez. Backend block listesi ne diyorsa o render edilir.
 */
export async function getUnifiedPdp(
  slug: string,
  params?: PdpApiParams
): Promise<UnifiedPdpResponse | null> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.context) {
      searchParams.append("context", params.context);
    }
    if (params?.variant_id) {
      searchParams.append("variant_id", params.variant_id.toString());
    }
    if (params?.seller_id) {
      searchParams.append("seller_id", params.seller_id.toString());
    }
    if (params?.selected_attributes) {
      searchParams.append("attributes", JSON.stringify(params.selected_attributes));
    }

    const queryString = searchParams.toString();
    const endpoint = `/pdp/${slug}${queryString ? `?${queryString}` : ""}`;

    const response = await apiGet<{ success: boolean; data: UnifiedPdpResponse }>(
      endpoint,
      {
        next: {
          tags: ["pdp", `pdp-${slug}`, `pdp-${slug}-${params?.context || "page"}`],
          revalidate: 60,
        },
      }
    );

    if (!response.success) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching unified PDP for ${slug}:`, error);
    return null;
  }
}

/** PDP for full page view */
export async function getPdpPage(slug: string): Promise<UnifiedPdpResponse | null> {
  return getUnifiedPdp(slug, { context: "page" });
}

/** PDP for cart modal */
export async function getPdpForCartModal(slug: string): Promise<UnifiedPdpResponse | null> {
  return getUnifiedPdp(slug, { context: "modal" });
}

/** PDP for quickview */
export async function getPdpForQuickView(slug: string): Promise<UnifiedPdpResponse | null> {
  return getUnifiedPdp(slug, { context: "quickview" });
}

/** PDP for cart item (minimal data) */
export async function getPdpForCart(slug: string): Promise<UnifiedPdpResponse | null> {
  return getUnifiedPdp(slug, { context: "cart" });
}

// ============================================
// LEGACY PDP MICRO ENDPOINTS (backward compat)
// ============================================

/**
 * PDP Micro Endpoints - Trendyol-style architecture
 * Each endpoint has its own cache strategy
 */

// ============================================
// 1. PRODUCT CORE (Long cache: 1 day)
// ============================================
export interface ProductCore {
  id: number;
  slug: string;
  title: string;
  description: string;
  short_description?: string;
  additional_info?: string[];
  safety_info?: string;
  brand: {
    id: number;
    name: string;
    slug: string;
    logo?: string;
  };
  category: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    url: string;
    order: number;
  }>;
  attributes: Array<{
    id: number;
    key: string;
    value: string;
  }>;
  guarantees: Array<{
    id: number;
    type: string;
    description: string;
  }>;
  faqs: Array<{
    id: number;
    question: string;
    answer: string;
  }>;
  vendor_id: number;
  status: string;
}

export async function getProductCore(
  identifier: string | number
): Promise<ProductCore | null> {
  try {
    const isSlug = typeof identifier === "string";
    const response = await apiGet<{ data: ProductCore }>(
      `/product-core/${identifier}`,
      {
        next: {
          tags: ["product-core", `product-core-${identifier}`],
          revalidate: 86400, // 1 day (24 hours)
        },
      }
    );
    const core = response.data || null;
    
    // If API returns null, try fallback with seed data
    if (!core) {
      console.log(`Product core ${identifier} not found in API, trying seed data`);
      return getProductCoreFromSeed(identifier);
    }
    
    return core;
  } catch (error) {
    console.error(`Error fetching product core ${identifier}:`, error);
    // Fallback: use seed data
    console.log(`Using seed data fallback for product core ${identifier}`);
    return getProductCoreFromSeed(identifier);
  }
}

function getProductCoreFromSeed(identifier: string | number): ProductCore | null {
  // Find product in seed data
  let product;
  if (typeof identifier === "string") {
    // Try exact match first
    product = allProducts.find(p => p.slug === identifier);
    
    // If not found, try removing trailing numbers (e.g., "kadin-deri-omuz-cantasi-12" -> "kadin-deri-omuz-cantasi")
    if (!product) {
      const slugWithoutNumbers = identifier.replace(/-\d+$/, '');
      product = allProducts.find(p => p.slug === slugWithoutNumbers);
    }
    
    // If still not found, try partial match
    if (!product) {
      const slugBase = identifier.split('-').slice(0, -1).join('-');
      product = allProducts.find(p => p.slug.startsWith(slugBase));
    }
  } else {
    product = allProducts.find(p => p.id === identifier);
  }

  if (!product) {
    return null;
  }

  // Convert Product to ProductCore format
  const brand = typeof product.brand === "string"
    ? { id: 0, name: product.brand, slug: product.brand_slug }
    : product.brand;

  return {
    id: product.id,
    slug: product.slug,
    title: product.name || product.title || "",
    description: product.description,
    short_description: product.short_description,
    additional_info: product.specifications
      ? Object.entries(product.specifications).map(([key, value]) => `${key}: ${value}`)
      : [],
    safety_info: undefined,
    brand: {
      id: brand.id || 0,
      name: brand.name || "",
      slug: brand.slug || product.brand_slug,
      logo: brand.logo,
    },
    category: product.category
      ? [
          {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          },
        ]
      : [],
    images: product.images.map((img, index) => ({
      id: img.id,
      url: img.url,
      order: index,
    })),
    attributes: product.specifications
      ? Object.entries(product.specifications).map(([key, value], index) => ({
          id: index + 1,
          key,
          value: String(value),
        }))
      : [],
    guarantees: [],
    faqs: [],
    vendor_id: product.vendor_id,
    status: product.is_in_stock ? "active" : "inactive",
  };
}

// ============================================
// 2. PRICING (Short cache: 30 seconds)
// ============================================
export interface Pricing {
  product_id: number;
  variant_id: number | null;
  price: number;
  sale_price: number | null;
  original_price: number | null;
  final_price: number;
  currency: string;
  stock: number;
  is_in_stock: boolean;
  campaign: {
    id: number;
    title: string;
    discount_type: string;
    discount_value: number;
    discount_amount: number;
  } | null;
  variants: Array<{
    id: number;
    price: number;
    sale_price: number | null;
    stock: number;
    is_default: boolean;
    value?: string;
  }>;
}

export async function getPricing(
  productId: number,
  variantId?: number
): Promise<Pricing | null> {
  try {
    const params = variantId ? `?variant=${variantId}` : "";
    const response = await apiGet<{ data: Pricing }>(
      `/pricing/${productId}${params}`,
      {
        next: {
          tags: ["pricing", `pricing-${productId}`],
          revalidate: 30, // 30 seconds
        },
      }
    );
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching pricing for product ${productId}:`, error);
    return null;
  }
}

// ============================================
// 3. SELLER (Medium cache: 5 minutes)
// ============================================
export interface Seller {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  review_count: number;
  follower_count: number;
  product_count: number;
  is_official: boolean;
  badges: Array<{
    id: number;
    name: string;
    icon?: string;
  }>;
  tier: {
    id: number;
    name: string;
  } | null;
  shipping_speed: {
    estimated_days: number;
    same_day_shipping: boolean;
    cutoff_time: string;
  };
  return_policy: {
    days: number;
    is_free: boolean;
    conditions: string;
  };
  is_following: boolean;
}

export async function getSeller(sellerId: number | null | undefined): Promise<Seller | null> {
  if (!sellerId) {
    return null;
  }
  
  try {
    const response = await apiGet<{ data: Seller }>(`/seller/${sellerId}`, {
      next: {
        tags: ["seller", `seller-${sellerId}`],
        revalidate: 300, // 5 minutes
      },
    });
    return response.data || null;
  } catch (error: any) {
    // Silently fail - seller info is optional
    // Laravel backend may have issues with seller endpoint
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Warning: Could not fetch seller ${sellerId}. Seller info will be hidden.`);
    }
    return null;
  }
}

// ============================================
// 4. CAMPAIGNS (User-based cache: 10 minutes)
// ============================================
export interface ProductCampaigns {
  product_campaigns: Array<{
    id: number;
    title: string;
    type: string;
    discount_type: string;
    discount_value: number;
  }>;
  coupons: Array<{
    id: number;
    code: string;
    title: string;
    discount_type: string;
    discount_value: number;
    min_order: number | null;
  }>;
  follow_rewards: Array<{
    type: string;
    title: string;
    discount_rate: number;
    action: string;
    target_id: number;
  }>;
  bundles: Array<{
    id: number;
    type: string;
    title: string;
    discount_rate: number;
    items: Array<{
      product_id: number;
      product_name: string | null;
    }>;
  }>;
}

export async function getProductCampaigns(
  productId: number
): Promise<ProductCampaigns> {
  try {
    const response = await apiGet<{ data: ProductCampaigns }>(
      `/campaigns?productId=${productId}`,
      {
        next: {
          tags: ["campaigns", `campaigns-product-${productId}`],
          revalidate: 600, // 10 minutes
        },
      }
    );
    return response.data || {
      product_campaigns: [],
      coupons: [],
      follow_rewards: [],
      bundles: [],
    };
  } catch (error) {
    console.error(
      `Error fetching campaigns for product ${productId}:`,
      error
    );
    return {
      product_campaigns: [],
      coupons: [],
      follow_rewards: [],
      bundles: [],
    };
  }
}

// ============================================
// 5. ENGAGEMENT (Very short cache: 30 seconds)
// ============================================
export interface Engagement {
  product_id: number;
  view_count: number;
  favorite_count: number;
  cart_count: number;
  purchase_count: number;
  reviews: {
    total: number;
    average_rating: number;
    distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  qa_count: number;
  user: {
    is_favorite: boolean;
    is_in_cart: boolean;
    has_price_alert: boolean;
  };
}

export async function getEngagement(
  productId: number
): Promise<Engagement | null> {
  try {
    const response = await apiGet<{ data: Engagement }>(
      `/engagement/${productId}`,
      {
        next: {
          tags: ["engagement", `engagement-${productId}`],
          revalidate: 30, // 30 seconds
        },
      }
    );
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching engagement for product ${productId}:`, error);
    return null;
  }
}


// ============================================
// 6. PDP BLOCKS (Medium cache: 6 hours)
// ============================================
export interface PDPBlock {
  id: number;
  type: string; // banner | badge | shipping | advantage | notice
  position: string; // above_price | under_price | under_gallery | sidebar
  priority: number;
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  color?: string;
  cta_text?: string;
  cta_link?: string;
}

export async function getPDPBlocks(
  productId: number
): Promise<Record<string, PDPBlock[]>> {
  try {
    const response = await apiGet<{ data: Record<string, PDPBlock[]> }>(
      `/pdp-blocks/${productId}`,
      {
        next: {
          tags: ["pdp-blocks", `pdp-blocks-${productId}`],
          revalidate: 21600, // 6 hours
        },
      }
    );
    // Backend returns grouped blocks by position, or empty array if no blocks
    const blocks = response.data || {};
    // Ensure it's an object (Record), not an array
    return typeof blocks === 'object' && !Array.isArray(blocks) ? blocks : {};
  } catch (error: any) {
    // Silently return empty blocks - blocks are optional feature
    // Only log if it's not a 404 or network error
    if (error?.status && error.status !== 404) {
      console.error(`Error fetching PDP blocks for product ${productId}:`, error?.message || error);
    }
    return {};
  }
}
