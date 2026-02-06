'use client';

import { useCallback, useMemo } from 'react';
import { Check } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Product, ProductVariant } from '@/types/pdp';

interface VariantSelectorProps {
  product: Product;
}

/**
 * Variant Selector with URL State
 * 
 * Seçimler URL'e yazılır:
 * - /product/urun-adi?size=M&color=black
 * - SEO + share + reload için kritik
 */
export function VariantSelector({ product }: VariantSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!product) {
    return null;
  }

  const { variants = [] } = product;

  // URL'den mevcut seçimleri oku
  const selectedAttributes = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  // Mevcut seçime göre varyantı bul
  const selectedVariant = useMemo(() => {
    if (Object.keys(selectedAttributes).length === 0) {
      return variants[0] || null;
    }
    return variants.find((v) =>
      Object.entries(selectedAttributes).every(
        ([key, value]) => v.attributes[key] === value
      )
    ) || variants[0] || null;
  }, [selectedAttributes, variants]);

  // Attribute key'leri
  const attributeKeys = useMemo(() => {
    return Object.keys(variants[0]?.attributes || {});
  }, [variants]);

  // Attribute seçeneklerini grupla
  const attributeOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};
    attributeKeys.forEach((key) => {
      options[key] = new Set(variants.map((v) => v.attributes[key]));
    });
    return options;
  }, [attributeKeys, variants]);

  // Attribute seçimi handler'ı
  const handleAttributeChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    // Toggle behavior
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // URL'i güncelle (replace: true -> history'e yeni entry ekleme)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Direkt varyant seçimi (eğer varyant ID'si varsa)
  const handleVariantSelect = useCallback((variant: ProductVariant) => {
    const params = new URLSearchParams();
    Object.entries(variant.attributes).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  // Stok durumunu kontrol et
  const isAttributeAvailable = useCallback((key: string, value: string) => {
    return variants.some(
      (v) =>
        v.attributes[key] === value &&
        Object.entries(selectedAttributes)
          .filter(([k]) => k !== key)
          .every(([k, val]) => v.attributes[k] === val) &&
        v.stock > 0
    );
  }, [selectedAttributes, variants]);

  if (variants.length === 0) return null;

  // Eğer tek varyant varsa ve attribute yoksa, basit gösterim
  if (variants.length === 1 && attributeKeys.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-sm text-gray-600">
          Stok: <span className="font-medium text-gray-900">{variants[0].stock} adet</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attributeKeys.map((key) => (
        <div key={key}>
          <h3 className="mb-2 text-sm font-medium text-gray-900 capitalize">
            {translateAttribute(key)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(attributeOptions[key]).map((value) => {
              const isSelected = selectedAttributes[key] === value;
              const isAvailable = isAttributeAvailable(key, value);

              return (
                <button
                  key={value}
                  onClick={() => handleAttributeChange(key, value)}
                  disabled={!isAvailable}
                  className={`relative rounded-lg border px-4 py-2 text-sm transition ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : isAvailable
                      ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      : 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 line-through'
                  }`}
                >
                  {value}
                  {isSelected && (
                    <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-orange-500 text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Seçili Varyant Bilgisi */}
      {selectedVariant && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-600">
            Seçilen: <span className="font-medium text-gray-900">{selectedVariant.title}</span>
          </p>
          <p className="text-sm text-gray-600">
            Stok: <span className={`font-medium ${selectedVariant.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
              {selectedVariant.stock} adet
            </span>
          </p>
          {selectedVariant.stock < 5 && selectedVariant.stock > 0 && (
            <p className="mt-1 text-xs text-orange-600">Son {selectedVariant.stock} adet!</p>
          )}
        </div>
      )}

      {/* Hızlı varyant seçimi (opsiyonel) */}
      {variants.length <= 5 && variants.length > 1 && attributeKeys.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => handleVariantSelect(variant)}
              disabled={variant.stock === 0}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                selectedVariant?.id === variant.id
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              } ${variant.stock === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {variant.title}
              {variant.stock === 0 && (
                <span className="ml-2 text-xs text-gray-400">(Tükendi)</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Attribute key'leri Türkçe'ye çevir
function translateAttribute(key: string): string {
  const translations: Record<string, string> = {
    // English keys
    size: 'Beden',
    color: 'Renk',
    material: 'Materyal',
    style: 'Stil',
    pattern: 'Desen',
    fit: 'Kalıp',
    length: 'Boy',
    width: 'Genişlik',
    height: 'Yükseklik',
    weight: 'Ağırlık',
    capacity: 'Kapasite',
    volume: 'Hacim',
    ram: 'RAM',
    storage: 'Depolama',
    processor: 'İşlemci',
    screen: 'Ekran',
    battery: 'Pil',
    // Turkish keys (from unified PDP)
    beden: 'Beden',
    renk: 'Renk',
    ton: 'Ton',
    hacim: 'Hacim',
    boy: 'Boy',
    kapasite: 'Kapasite',
    depolama: 'Depolama',
    malzeme: 'Malzeme',
    boyut: 'Boyut',
    agirlik: 'Ağırlık',
    adet: 'Adet',
  };
  return translations[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
}
