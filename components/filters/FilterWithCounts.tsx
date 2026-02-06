'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Filter, FilterOption } from '@/types/pdp';

interface FilterWithCountsProps {
  filter: Filter;
  selectedValues: string[];
  counts: Record<string, number>; // Pre-aggregated counts
  onToggle: (value: string) => void;
}

/**
 * Filter Component with Pre-aggregated Counts
 * 
 * Trendyol stili: "Beden M (124)" gösterimi
 * Count'lar backend'den gelir (nightly job + Redis)
 */
export function FilterWithCounts({ 
  filter, 
  selectedValues, 
  counts, 
  onToggle 
}: FilterWithCountsProps) {
  const [isExpanded, setIsExpanded] = useState(!filter.is_collapsed);
  const [showAll, setShowAll] = useState(false);

  // Count'ları option'lara ekle
  const optionsWithCounts: (FilterOption & { count?: number })[] = filter.options?.map(opt => ({
    ...opt,
    count: counts[opt.value] ?? opt.count ?? 0,
  })) || [];

  // Count'a göre sırala (yüksekten düşüğe)
  const sortedOptions = [...optionsWithCounts].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  // Gösterilecek option'ları limitli göster
  const displayOptions = showAll ? sortedOptions : sortedOptions.slice(0, 5);
  const hasMore = sortedOptions.length > 5;

  const isSelected = (value: string) => selectedValues.includes(value);

  return (
    <div className="border-b border-gray-100 pb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between py-2 text-left"
      >
        <span className="font-medium text-gray-900">{filter.label}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          {displayOptions.map((option) => {
            const selected = isSelected(option.value);
            const hasCount = option.count !== undefined && option.count > 0;

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg py-2 px-2 transition ${
                  selected ? 'bg-orange-50' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition ${
                    selected
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300 bg-white'
                  }`}
                  onClick={() => onToggle(option.value)}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
                
                <span className={`flex-1 text-sm ${selected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                  {option.label}
                </span>
                
                {/* ✅ Pre-aggregated count gösterimi */}
                {filter.show_count && hasCount && (
                  <span className={`text-xs ${selected ? 'text-orange-600' : 'text-gray-400'}`}>
                    ({formatCount(option.count!)})
                  </span>
                )}
                
                {/* Seçili ama count 0 ise uyarı */}
                {selected && option.count === 0 && (
                  <span className="text-xs text-red-500">(0)</span>
                )}
              </label>
            );
          })}

          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              {showAll 
                ? 'Daha Az Göster' 
                : `+${sortedOptions.length - 5} daha fazla göster`
              }
            </button>
          )}

          {/* Hiç sonuç yoksa bilgi mesajı */}
          {sortedOptions.length === 0 && (
            <p className="py-2 text-sm text-gray-400">
              Bu kategoride {filter.label.toLowerCase()} bulunmuyor
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Sayı formatla (1000 -> 1K)
function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Active Filters Summary
 * Seçili filtrelerin özetini göster
 */
interface ActiveFiltersProps {
  filters: Filter[];
  appliedFilters: Record<string, string | string[]>;
  onRemove: (key: string, value?: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, appliedFilters, onRemove, onClearAll }: ActiveFiltersProps) {
  const activeCount = Object.values(appliedFilters).flat().length;

  if (activeCount === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Aktif Filtreler:</span>
      
      {Object.entries(appliedFilters).map(([key, value]) => {
        const filter = filters.find(f => f.key === key);
        if (!filter) return null;

        const values = Array.isArray(value) ? value : [value];

        return values.map(val => {
          const option = filter.options?.find(o => o.value === val);
          return (
            <span
              key={`${key}-${val}`}
              className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700"
            >
              {filter.label}: {option?.label || val}
              <button
                onClick={() => onRemove(key, val)}
                className="ml-1 rounded-full hover:bg-orange-200"
              >
                ×
              </button>
            </span>
          );
        });
      })}

      <button
        onClick={onClearAll}
        className="text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        Tümünü Temizle
      </button>
    </div>
  );
}
