'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { pdpApi } from '@/services/pdpApi';
import type { PdpData, ProductVariant } from '@/types/pdp';

interface UsePdpWithUrlReturn {
  data: PdpData | null;
  isLoading: boolean;
  error: Error | null;
  selectedVariant: ProductVariant | null;
  selectedAttributes: Record<string, string>;
  selectVariantById: (variantId: number) => void;
  selectAttribute: (key: string, value: string) => void;
  refresh: () => Promise<void>;
}

/**
 * PDP Hook with URL State Management
 * 
 * Variant seçimleri URL'e yazılır:
 * - /product/urun-adi?size=M&color=black
 * - Bu SEO + share + reload için kritik
 */
export function usePdpWithUrl(slug: string): UsePdpWithUrlReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PdpData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // URL'den attribute'ları oku
  const selectedAttributes = Object.fromEntries(searchParams.entries());

  // Mevcut seçime göre varyantı bul
  const selectedVariant = data?.product.variants.find((v) => {
    if (Object.keys(selectedAttributes).length === 0) {
      return v.id === data.product.variants[0]?.id;
    }
    return Object.entries(selectedAttributes).every(
      ([key, value]) => v.attributes[key] === value
    );
  }) || data?.product.variants[0] || null;

  // PDP verisini çek
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await pdpApi.getProduct(slug);
      
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch product');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // Varyant ID ile seçim (direkt seçim)
  const selectVariantById = useCallback((variantId: number) => {
    const variant = data?.product.variants.find(v => v.id === variantId);
    if (!variant) return;

    // URL'i güncelle
    const params = new URLSearchParams();
    Object.entries(variant.attributes).forEach(([key, value]) => {
      params.set(key, value);
    });

    // replace: true -> history'e yeni entry ekleme
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [data, pathname, router]);

  // Attribute ile seçim (incremental)
  const selectAttribute = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    // Toggle behavior: aynı değerse kaldır
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Eğer bu seçim başka bir varyanta yönlendiriyorsa, URL'i güncelle
    const newAttributes = Object.fromEntries(params.entries());
    
    const matchingVariant = data?.product.variants.find((v) =>
      Object.entries(newAttributes).every(
        ([k, val]) => v.attributes[k] === val
      )
    );

    if (matchingVariant) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [data, pathname, router, searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    selectedVariant,
    selectedAttributes,
    selectVariantById,
    selectAttribute,
    refresh: fetchData,
  };
}

/**
 * Hook for Social Proof with optimized polling
 * - Client polling yerine lightweight approach
 * - visibilitychange ile optimize edilmiş
 */
export function useSocialProofOptimized(slug: string, refreshInterval = 30000) {
  const [socialProof, setSocialProof] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // Sayfa görünürlüğü değişince polling'i durdur
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const fetchSocialProof = async () => {
      if (!isVisible) return; // Sayfa görünmüyorsa çekme
      
      try {
        const response = await pdpApi.getSocialProof(slug);
        if (response.success) {
          setSocialProof(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch social proof:', error);
      }
    };

    // Initial fetch
    fetchSocialProof();

    // Set up interval
    const interval = setInterval(fetchSocialProof, refreshInterval);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [slug, refreshInterval, isVisible]);

  return socialProof;
}
