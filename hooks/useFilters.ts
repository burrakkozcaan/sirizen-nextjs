"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { FilterConfig, FiltersResponse, DynamicFilterValues } from "@/types";

interface UseFiltersOptions {
  categorySlug?: string;
  campaignSlug?: string;
  filterType?: 'category' | 'campaign' | 'search';
  initialSearchParams?: Record<string, string>;
}

interface UseFiltersReturn {
  filters: FilterConfig[];
  filterValues: DynamicFilterValues;
  isLoading: boolean;
  error: Error | null;
  updateFilter: (key: string, value: DynamicFilterValues[string]) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  getActiveFilterCount: () => number;
  getActiveFilters: () => Array<{ key: string; label: string; value: string; filterLabel: string }>;
  buildQueryParams: () => URLSearchParams;
}

export function useFilters({ categorySlug, campaignSlug, filterType = 'category', initialSearchParams = {} }: UseFiltersOptions): UseFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Parse initial filter values from URL
  const [filterValues, setFilterValues] = useState<DynamicFilterValues>(() => {
    const values: DynamicFilterValues = {};

    // Parse from searchParams
    searchParams.forEach((value, key) => {
      if (key === 'page' || key === 'per_page' || key === 'sort_by') return;

      // Handle array params (e.g., brand[]=x&brand[]=y)
      if (key.endsWith('[]')) {
        const baseKey = key.slice(0, -2);
        const existing = values[baseKey];
        if (Array.isArray(existing)) {
          (existing as string[]).push(value);
        } else {
          values[baseKey] = [value];
        }
      }
      // Handle comma-separated values
      else if (value.includes(',')) {
        values[key] = value.split(',').filter(Boolean);
      }
      // Handle range values (e.g., price=100-500)
      else if (value.includes('-') && !isNaN(Number(value.split('-')[0]))) {
        const [min, max] = value.split('-').map(Number);
        values[key] = [min, max] as [number, number];
      }
      // Handle boolean values
      else if (value === 'true' || value === 'false') {
        values[key] = value === 'true';
      }
      // Handle numeric values
      else if (!isNaN(Number(value)) && value !== '') {
        values[key] = Number(value);
      }
      // String values
      else {
        values[key] = value;
      }
    });

    return values;
  });

  // Fetch filters from backend
  useEffect(() => {
    const fetchFilters = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let endpoint = '/filters';
        if (filterType === 'category' && categorySlug) {
          endpoint = `/filters/category/${categorySlug}`;
        } else if (filterType === 'campaign' && campaignSlug) {
          endpoint = `/filters/campaign/${campaignSlug}`;
        } else if (filterType === 'search') {
          endpoint = '/filters/search';
        }

        const response = await api.get<FiltersResponse>(endpoint);
        setFilters(response.filters || []);
      } catch (err) {
        console.error("Error fetching filters:", err);
        setError(err as Error);
        // Set default filters on error
        setFilters(getDefaultFilters());
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilters();
  }, [categorySlug, campaignSlug, filterType]);

  // Update URL when filter values change
  const updateUrl = useCallback((values: DynamicFilterValues) => {
    const params = new URLSearchParams();

    // Preserve sort and pagination
    const sort = searchParams.get('sort_by');
    const page = searchParams.get('page');
    if (sort) params.set('sort_by', sort);
    if (page && page !== '1') params.set('page', page);

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          value === false) {
        return;
      }

      if (Array.isArray(value)) {
        if (typeof value[0] === 'number' && typeof value[1] === 'number') {
          // Range value
          params.set(key, `${value[0]}-${value[1]}`);
        } else {
          // String array
          params.set(key, value.join(','));
        }
      } else if (typeof value === 'boolean') {
        params.set(key, 'true');
      } else {
        params.set(key, String(value));
      }
    });

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [router, searchParams]);

  // Update a single filter
  const updateFilter = useCallback((key: string, value: DynamicFilterValues[string]) => {
    setFilterValues(prev => {
      const newValues = { ...prev, [key]: value };

      // Remove undefined/null/empty values
      if (value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          value === false) {
        delete newValues[key];
      }

      updateUrl(newValues);
      return newValues;
    });
  }, [updateUrl]);

  // Clear a single filter
  const clearFilter = useCallback((key: string) => {
    setFilterValues(prev => {
      const newValues = { ...prev };
      delete newValues[key];
      updateUrl(newValues);
      return newValues;
    });
  }, [updateUrl]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilterValues({});
    updateUrl({});
  }, [updateUrl]);

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    return Object.keys(filterValues).filter(key => {
      const value = filterValues[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      return value !== undefined && value !== null && value !== '';
    }).length;
  }, [filterValues]);

  // Get list of active filters for display
  const getActiveFilters = useCallback(() => {
    const activeFilters: Array<{ key: string; label: string; value: string; filterLabel: string }> = [];

    Object.entries(filterValues).forEach(([key, value]) => {
      const filterConfig = filters.find(f => f.key === key);
      const filterLabel = filterConfig?.label || key;

      if (Array.isArray(value)) {
        if (typeof value[0] === 'number' && typeof value[1] === 'number') {
          // Range
          const unit = filterConfig?.unit || '';
          activeFilters.push({
            key,
            label: `${value[0]} - ${value[1]} ${unit}`.trim(),
            value: `${value[0]}-${value[1]}`,
            filterLabel,
          });
        } else {
          // Array of strings
          value.forEach(v => {
            const option = filterConfig?.options?.find(o => o.value === v);
            activeFilters.push({
              key,
              label: option?.label || String(v),
              value: String(v),
              filterLabel,
            });
          });
        }
      } else if (typeof value === 'boolean' && value) {
        activeFilters.push({
          key,
          label: filterLabel,
          value: 'true',
          filterLabel,
        });
      } else if (typeof value === 'number') {
        if (filterConfig?.type === 'rating') {
          activeFilters.push({
            key,
            label: `${value}+ yıldız`,
            value: String(value),
            filterLabel,
          });
        } else {
          activeFilters.push({
            key,
            label: String(value),
            value: String(value),
            filterLabel,
          });
        }
      } else if (value) {
        const option = filterConfig?.options?.find(o => o.value === value);
        activeFilters.push({
          key,
          label: option?.label || String(value),
          value: String(value),
          filterLabel,
        });
      }
    });

    return activeFilters;
  }, [filterValues, filters]);

  // Build query params for API call
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(filterValues).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          value === false) {
        return;
      }

      if (Array.isArray(value)) {
        if (typeof value[0] === 'number' && typeof value[1] === 'number') {
          // Range - send as min/max
          if (key === 'price') {
            params.set('min_price', String(value[0]));
            params.set('max_price', String(value[1]));
          } else {
            params.set(`min_${key}`, String(value[0]));
            params.set(`max_${key}`, String(value[1]));
          }
        } else {
          // Array - send each value
          value.forEach(v => params.append(`${key}[]`, String(v)));
        }
      } else if (typeof value === 'boolean') {
        params.set(key, 'true');
      } else {
        params.set(key, String(value));
      }
    });

    return params;
  }, [filterValues]);

  return {
    filters,
    filterValues,
    isLoading,
    error,
    updateFilter,
    clearFilter,
    clearAllFilters,
    getActiveFilterCount,
    getActiveFilters,
    buildQueryParams,
  };
}

// Default filters when API fails
function getDefaultFilters(): FilterConfig[] {
  return [
    // Brand at top with search
    {
      key: 'brand',
      label: 'Marka',
      type: 'checkbox',
      is_collapsed: false,
      show_count: true,
      options: [],
    },
    // Color filter
    {
      key: 'color',
      label: 'Renk',
      type: 'color',
      is_collapsed: false,
      options: [
        { value: 'siyah', label: 'Siyah', hex: '#000000' },
        { value: 'beyaz', label: 'Beyaz', hex: '#FFFFFF' },
        { value: 'kirmizi', label: 'Kırmızı', hex: '#EF4444' },
        { value: 'mavi', label: 'Mavi', hex: '#3B82F6' },
        { value: 'yesil', label: 'Yeşil', hex: '#22C55E' },
        { value: 'sari', label: 'Sarı', hex: '#EAB308' },
        { value: 'turuncu', label: 'Turuncu', hex: '#F97316' },
        { value: 'mor', label: 'Mor', hex: '#A855F7' },
        { value: 'pembe', label: 'Pembe', hex: '#EC4899' },
        { value: 'kahverengi', label: 'Kahverengi', hex: '#92400E' },
        { value: 'gri', label: 'Gri', hex: '#6B7280' },
        { value: 'lacivert', label: 'Lacivert', hex: '#1E3A8A' },
        { value: 'bej', label: 'Bej', hex: '#D4B896' },
      ],
    },
    // Size filter (for clothing, shoes, etc.)
    {
      key: 'size',
      label: 'Beden',
      type: 'checkbox',
      is_collapsed: false,
      show_count: true,
      options: [
        { value: 'xs', label: 'XS' },
        { value: 's', label: 'S' },
        { value: 'm', label: 'M' },
        { value: 'l', label: 'L' },
        { value: 'xl', label: 'XL' },
        { value: 'xxl', label: 'XXL' },
        { value: '3xl', label: '3XL' },
        // Shoe sizes
        { value: '36', label: '36' },
        { value: '37', label: '37' },
        { value: '38', label: '38' },
        { value: '39', label: '39' },
        { value: '40', label: '40' },
        { value: '41', label: '41' },
        { value: '42', label: '42' },
        { value: '43', label: '43' },
        { value: '44', label: '44' },
        { value: '45', label: '45' },
      ],
    },
    // Price range
    {
      key: 'price',
      label: 'Fiyat',
      type: 'range',
      is_collapsed: false,
      min: 0,
      max: 10000,
      step: 50,
      unit: 'TL',
    },
    // Rating filter
    {
      key: 'rating',
      label: 'Değerlendirme',
      type: 'rating',
      is_collapsed: true,
    },
    // Boolean filters
    {
      key: 'free_shipping',
      label: 'Ücretsiz Kargo',
      type: 'boolean',
      is_collapsed: false,
    },
    {
      key: 'fast_delivery',
      label: 'Hızlı Teslimat',
      type: 'boolean',
      is_collapsed: false,
    },
    {
      key: 'in_stock',
      label: 'Sadece Stokta Olanlar',
      type: 'boolean',
      is_collapsed: false,
    },
  ];
}
