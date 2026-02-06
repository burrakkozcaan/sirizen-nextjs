// ============================================
// PDP API Service for Laravel Backend
// ============================================

import type { 
  PdpData, 
  Badge, 
  SocialProof, 
  HighlightAttribute, 
  ProductVariant,
  ProductListItem,
  CategoryPageData,
  Filter,
  Category,
  ApiResponse,
  PaginatedResponse 
} from '@/types/pdp';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sirizen.com';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// PDP API
// ============================================

export const pdpApi = {
  // Get full PDP data
  getProduct: (slug: string) => 
    fetchApi<ApiResponse<PdpData>>(`/pdp/${slug}`),

  // Get only badges
  getBadges: (slug: string) => 
    fetchApi<ApiResponse<Badge[]>>(`/pdp/${slug}/badges`),

  // Get social proof
  getSocialProof: (slug: string) => 
    fetchApi<ApiResponse<SocialProof>>(`/pdp/${slug}/social-proof`),

  // Get highlights
  getHighlights: (slug: string) => 
    fetchApi<ApiResponse<HighlightAttribute[]>>(`/pdp/${slug}/highlights`),

  // Get variant
  getVariant: (slug: string, params: { variant_id?: number; attributes?: Record<string, string> }) => {
    const queryParams = new URLSearchParams();
    if (params.variant_id) queryParams.append('variant_id', String(params.variant_id));
    if (params.attributes) queryParams.append('attributes', JSON.stringify(params.attributes));
    return fetchApi<ApiResponse<ProductVariant>>(`/pdp/${slug}/variant?${queryParams}`);
  },

  // Get reviews
  getReviews: (slug: string, page = 1) => 
    fetchApi<ApiResponse<PaginatedResponse<Review>>>(`/pdp/${slug}/reviews?page=${page}`),

  // Get related products
  getRelated: (slug: string) => 
    fetchApi<ApiResponse<ProductListItem[]>>(`/pdp/${slug}/related`),
};

// ============================================
// Category & Filter API
// ============================================

export const categoryApi = {
  // Get category with products and filters
  getCategory: (slug: string, params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    return fetchApi<ApiResponse<CategoryPageData>>(`/categories/${slug}?${queryParams}`);
  },

  // Get only filters
  getFilters: (slug: string) => 
    fetchApi<ApiResponse<Filter[]>>(`/categories/${slug}/filters`),

  // Get category tree
  getTree: () => 
    fetchApi<ApiResponse<Category[]>>(`/categories/tree`),
};

// Review type (add to types/pdp.ts if not exists)
interface Review {
  id: number;
  rating: number;
  comment: string;
  user: {
    name: string;
    avatar?: string;
  };
  created_at: string;
}
