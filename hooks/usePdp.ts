'use client';

import { useState, useEffect, useCallback } from 'react';
import { pdpApi } from '@/services/pdpApi';
import type { PdpData, ProductVariant } from '@/types/pdp';

interface UsePdpReturn {
  data: PdpData | null;
  isLoading: boolean;
  error: Error | null;
  selectedVariant: ProductVariant | null;
  selectVariant: (variantId: number) => void;
  refresh: () => Promise<void>;
}

export function usePdp(slug: string): UsePdpReturn {
  const [data, setData] = useState<PdpData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await pdpApi.getProduct(slug);
      
      if (response.success) {
        setData(response.data);
        // Set default variant if exists
        if (response.data.product.variants.length > 0) {
          setSelectedVariant(response.data.product.variants[0]);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch product');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const selectVariant = useCallback((variantId: number) => {
    if (!data) return;
    
    const variant = data.product.variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    selectedVariant,
    selectVariant,
    refresh: fetchData,
  };
}
