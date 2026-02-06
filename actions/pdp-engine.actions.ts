"use server";

import { apiGet } from "@/lib/api-server";
import type {
  PdpEngineData,
  PdpApiResponse,
  BadgesApiResponse,
  FiltersApiResponse,
  Badge,
  SocialProofData,
  HighlightAttributeValue,
  PdpBlockConfig,
} from "@/types/pdp-engine";

/**
 * PDP Engine - Trendyol-style Dynamic Product Page
 * 
 * Bu servis, kategori bazlı dinamik PDP verisini tek bir endpoint'ten sağlar:
 * - Layout (blok dizilimi)
 * - Badges (kurallı rozetler)
 * - Highlights (öne çıkan özellikler)
 * - Social Proof (sosyal kanıt)
 * - Filters (kategori bazlı filtreler)
 */

// ============================================
// MAIN PDP ENGINE ENDPOINT
// ============================================

/**
 * Ürün için tam PDP verisini getir (Layout + Badges + Highlights + Social Proof)
 * Cache: 1 saat (layout değişmez), badges 15 dakika
 */
export async function getPdpEngineData(
  slug: string
): Promise<PdpEngineData | null> {
  try {
    const response = await apiGet<PdpApiResponse>(`/pdp/${slug}`, {
      next: {
        tags: ["pdp-engine", `pdp-${slug}`],
        revalidate: 900, // 15 minutes
      },
    });

    return response.data || null;
  } catch (error) {
    console.error(`Error fetching PDP engine data for ${slug}:`, error);
    return null;
  }
}

// ============================================
// INDIVIDUAL ENDPOINTS (Micro-service style)
// ============================================

/**
 * Sadece badge'leri getir
 * Cache: 5 dakika (hızlı değişebilir)
 */
export async function getProductBadges(
  slug: string
): Promise<Badge[]> {
  try {
    const response = await apiGet<BadgesApiResponse>(`/pdp/${slug}/badges`, {
      next: {
        tags: ["pdp-badges", `badges-${slug}`],
        revalidate: 300, // 5 minutes
      },
    });

    return response.data?.badges || [];
  } catch (error) {
    console.error(`Error fetching badges for ${slug}:`, error);
    return [];
  }
}

/**
 * Sosyal kanıt verisini getir
 * Cache: 30 saniye (çok hızlı değişir)
 */
export async function getSocialProof(
  slug: string
): Promise<SocialProofData | null> {
  try {
    const response = await apiGet<{ data: { social_proof: SocialProofData | null } }>(
      `/pdp/${slug}/social-proof`,
      {
        next: {
          tags: ["pdp-social-proof", `social-proof-${slug}`],
          revalidate: 30, // 30 seconds
        },
      }
    );

    return response.data?.social_proof || null;
  } catch (error) {
    console.error(`Error fetching social proof for ${slug}:`, error);
    return null;
  }
}

/**
 * Öne çıkan özellikleri getir
 * Cache: 1 saat (attribute'lar değişmez)
 */
export async function getHighlightAttributes(
  slug: string
): Promise<HighlightAttributeValue[]> {
  try {
    const response = await apiGet<{ data: { highlights: HighlightAttributeValue[] } }>(
      `/pdp/${slug}/highlights`,
      {
        next: {
          tags: ["pdp-highlights", `highlights-${slug}`],
          revalidate: 3600, // 1 hour
        },
      }
    );

    return response.data?.highlights || [];
  } catch (error) {
    console.error(`Error fetching highlights for ${slug}:`, error);
    return [];
  }
}

// ============================================
// FILTER ENDPOINTS
// ============================================

/**
 * Kategori için filtreleri getir
 * Cache: 6 saat (filtre yapısı değişmez)
 */
export async function getFiltersByCategory(
  categorySlug: string
): Promise<FiltersApiResponse["data"] | null> {
  try {
    const response = await apiGet<FiltersApiResponse>(
      `/filters/category/${categorySlug}`,
      {
        next: {
          tags: ["filters", `filters-category-${categorySlug}`],
          revalidate: 21600, // 6 hours
        },
      }
    );

    return response.data || null;
  } catch (error) {
    console.error(`Error fetching filters for category ${categorySlug}:`, error);
    return null;
  }
}

/**
 * Kategori grubu için filtreleri getir
 * Cache: 6 saat
 */
export async function getFiltersByCategoryGroup(
  categoryGroupId: number
): Promise<FiltersApiResponse["data"] | null> {
  try {
    const response = await apiGet<FiltersApiResponse>(
      `/filters/category-group/${categoryGroupId}`,
      {
        next: {
          tags: ["filters", `filters-group-${categoryGroupId}`],
          revalidate: 21600, // 6 hours
        },
      }
    );

    return response.data || null;
  } catch (error) {
    console.error(
      `Error fetching filters for category group ${categoryGroupId}:`,
      error
    );
    return null;
  }
}

// ============================================
// LAYOUT HELPERS
// ============================================

/**
 * Pozisyona göre blokları filtrele
 */
export function getBlocksByPosition(
  blocks: PdpBlockConfig[],
  position: string
): PdpBlockConfig[] {
  return blocks
    .filter((block) => block.position === position && block.visible)
    .sort((a, b) => a.order - b.order);
}

/**
 * Varsayılan PDP layout (API'den veri gelmezse)
 */
export function getDefaultLayout(): PdpBlockConfig[] {
  return [
    { block: "gallery", position: "main", order: 1, visible: true },
    { block: "title", position: "main", order: 2, visible: true },
    { block: "rating", position: "main", order: 3, visible: true },
    { block: "badges", position: "main", order: 4, visible: true },
    { block: "social_proof", position: "under_title", order: 5, visible: true },
    { block: "price", position: "main", order: 6, visible: true },
    { block: "variant_selector", position: "main", order: 7, visible: true },
    { block: "attributes_highlight", position: "main", order: 8, visible: true },
    { block: "delivery_info", position: "main", order: 9, visible: true },
    { block: "campaigns", position: "main", order: 10, visible: true },
    { block: "add_to_cart", position: "main", order: 11, visible: true },
    { block: "seller_info", position: "sidebar", order: 1, visible: true },
    { block: "description", position: "bottom", order: 1, visible: true },
    { block: "attributes_detail", position: "bottom", order: 2, visible: true },
    { block: "reviews", position: "bottom", order: 3, visible: true },
    { block: "questions", position: "bottom", order: 4, visible: true },
    { block: "related_products", position: "bottom", order: 5, visible: true },
  ];
}
