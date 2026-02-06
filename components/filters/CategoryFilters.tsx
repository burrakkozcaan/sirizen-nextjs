"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { FilterConfig, FilterOption } from "@/types/pdp-engine";

interface CategoryFiltersProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, string[]>) => void;
  selectedFilters?: Record<string, string[]>;
}

/**
 * CategoryFilters - Kategori Bazlı Dinamik Filtreler
 * 
 * Trendyol tarzı kategoriye özel filtreler:
 * - Giyim: Beden, Renk, Materyal, Cinsiyet
 * - Elektronik: RAM, Depolama, Ekran Boyutu
 * - Kozmetik: Cilt Tipi, Marka, İçerik
 */
export function CategoryFilters({
  filters,
  onFilterChange,
  selectedFilters = {},
}: CategoryFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(selectedFilters);
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(() => {
    // Başlangıçta kapalı olması gereken filtreler
    const collapsed = filters
      .filter((f) => f.is_collapsed)
      .map((f) => f.key);
    return new Set(collapsed);
  });

  const toggleFilter = (filterKey: string) => {
    const newExpanded = new Set(expandedFilters);
    if (newExpanded.has(filterKey)) {
      newExpanded.delete(filterKey);
    } else {
      newExpanded.add(filterKey);
    }
    setExpandedFilters(newExpanded);
  };

  const handleOptionChange = (filterKey: string, optionValue: string, checked: boolean) => {
    const currentValues = localFilters[filterKey] || [];
    let newValues: string[];

    if (checked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter((v) => v !== optionValue);
    }

    const newFilters = { ...localFilters, [filterKey]: newValues };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRangeChange = (filterKey: string, value: number[]) => {
    const newFilters = { ...localFilters, [filterKey]: [`${value[0]}-${value[1]}`] };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.values(localFilters).flat().length;

  if (!filters || filters.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          <h3 className="font-semibold">Filtreler</h3>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Temizle ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="space-y-2">
        {filters.map((filter) => (
          <FilterGroup
            key={filter.id}
            filter={filter}
            isExpanded={!expandedFilters.has(filter.key)}
            selectedValues={localFilters[filter.key] || []}
            onToggle={() => toggleFilter(filter.key)}
            onOptionChange={(value, checked) =>
              handleOptionChange(filter.key, value, checked)
            }
            onRangeChange={(value) => handleRangeChange(filter.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Filter Group Component
// ============================================

interface FilterGroupProps {
  filter: FilterConfig;
  isExpanded: boolean;
  selectedValues: string[];
  onToggle: () => void;
  onOptionChange: (value: string, checked: boolean) => void;
  onRangeChange: (value: number[]) => void;
}

function FilterGroup({
  filter,
  isExpanded,
  selectedValues,
  onToggle,
  onOptionChange,
  onRangeChange,
}: FilterGroupProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
      >
        <span className="font-medium text-sm">{filter.display_label}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3">
          {filter.component === "checkbox" && (
            <CheckboxFilter
              options={filter.options || []}
              selectedValues={selectedValues}
              onChange={onOptionChange}
              showCount={filter.show_count}
            />
          )}

          {filter.component === "range" && (
            <RangeFilter
              config={filter.config}
              onChange={onRangeChange}
            />
          )}

          {filter.component === "color" && (
            <ColorFilter
              options={filter.options || []}
              selectedValues={selectedValues}
              onChange={onOptionChange}
            />
          )}

          {filter.component === "select" && (
            <SelectFilter
              options={filter.options || []}
              selectedValues={selectedValues}
              onChange={onOptionChange}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Filter Type Components
// ============================================

function CheckboxFilter({
  options,
  selectedValues,
  onChange,
  showCount,
}: {
  options: FilterOption[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
  showCount?: boolean;
}) {
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`filter-${option.value}`}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) =>
              onChange(option.value, checked as boolean)
            }
          />
          <Label
            htmlFor={`filter-${option.value}`}
            className="text-sm flex-1 cursor-pointer"
          >
            {option.label}
          </Label>
          {showCount && option.count !== undefined && (
            <span className="text-xs text-muted-foreground">
              ({option.count})
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function RangeFilter({
  config,
  onChange,
}: {
  config?: { min?: number; max?: number; step?: number; unit?: string };
  onChange: (value: number[]) => void;
}) {
  const min = config?.min || 0;
  const max = config?.max || 10000;
  const step = config?.step || 100;
  const unit = config?.unit || "TL";
  const [value, setValue] = useState([min, max]);

  return (
    <div className="space-y-4">
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={setValue}
        onValueCommit={onChange}
      />
      <div className="flex justify-between text-sm">
        <span>
          {value[0].toLocaleString("tr-TR")} {unit}
        </span>
        <span>
          {value[1].toLocaleString("tr-TR")} {unit}
        </span>
      </div>
    </div>
  );
}

function ColorFilter({
  options,
  selectedValues,
  onChange,
}: {
  options: FilterOption[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value, !selectedValues.includes(option.value))}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            selectedValues.includes(option.value)
              ? "border-primary scale-110"
              : "border-gray-200 hover:border-gray-300"
          }`}
          style={{ backgroundColor: option.color || option.value }}
          title={option.label}
        />
      ))}
    </div>
  );
}

function SelectFilter({
  options,
  selectedValues,
  onChange,
}: {
  options: FilterOption[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value, !selectedValues.includes(option.value))}
          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
            selectedValues.includes(option.value)
              ? "border-primary bg-primary/5 text-primary"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
