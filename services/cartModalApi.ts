// ============================================
// Cart Modal API Service
// ============================================

import type { 
  CartModalData, 
  CartModalVariantValidation,
  ApiResponse 
} from '@/types/cart-modal';

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

export const cartModalApi = {
  // Get cart modal data
  getModalData: (slug: string) => 
    fetchApi<ApiResponse<CartModalData>>(`/cart-modal/${slug}`),

  // Validate variant combination
  validateVariant: (slug: string, attributes: Record<string, string>) => 
    fetchApi<ApiResponse<CartModalVariantValidation>>(`/cart-modal/${slug}/validate-variant`, {
      method: 'POST',
      body: JSON.stringify({ attributes }),
    }),

  // Get layout config (for admin/debug)
  getLayoutConfig: (slug: string) => 
    fetchApi<ApiResponse<any>>(`/cart-modal/${slug}/layout-config`),
};
