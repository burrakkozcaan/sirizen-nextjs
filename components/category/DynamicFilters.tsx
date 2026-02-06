"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckboxFilter,
  RangeFilter,
  ColorFilter,
  RatingFilter,
  BooleanFilter,
} from "./filters";
import type { FilterConfig, DynamicFilterValues } from "@/types";

interface DynamicFiltersProps {
  filters: FilterConfig[];
  filterValues: DynamicFilterValues;
  isLoading?: boolean;
  onFilterChange: (key: string, value: DynamicFilterValues[string]) => void;
}

export function DynamicFilters({
  filters,
  filterValues,
  isLoading = false,
  onFilterChange,
}: DynamicFiltersProps) {
  // Track open/closed state for each filter section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    filters.forEach((f) => {
      initial[f.key] = !f.is_collapsed;
    });
    return initial;
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return <FiltersSkeleton />;
  }

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {filters.map((filter, index) => (
        <FilterSection
          key={filter.key}
          filter={filter}
          value={filterValues[filter.key]}
          isOpen={openSections[filter.key] ?? !filter.is_collapsed}
          onToggle={() => toggleSection(filter.key)}
          onChange={(value) => onFilterChange(filter.key, value)}
          showBorder={index > 0}
        />
      ))}
    </div>
  );
}

interface FilterSectionProps {
  filter: FilterConfig;
  value: DynamicFilterValues[string];
  isOpen: boolean;
  onToggle: () => void;
  onChange: (value: DynamicFilterValues[string]) => void;
  showBorder?: boolean;
}

function FilterSection({
  filter,
  value,
  isOpen,
  onToggle,
  onChange,
  showBorder = false,
}: FilterSectionProps) {
  // For boolean filters, render inline without collapsible
  if (filter.type === "boolean") {
    return (
      <div className={showBorder ? "border-t pt-3 mt-3" : ""}>
        <BooleanFilter
          filter={filter}
          value={value as boolean | undefined}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger
        className={`flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors ${
          showBorder ? "border-t pt-4" : ""
        }`}
      >
        {filter.label}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-1">
        {renderFilterComponent(filter, value, onChange)}
      </CollapsibleContent>
    </Collapsible>
  );
}

function renderFilterComponent(
  filter: FilterConfig,
  value: DynamicFilterValues[string],
  onChange: (value: DynamicFilterValues[string]) => void
) {
  switch (filter.type) {
    case "checkbox":
    case "multiselect":
      return (
        <CheckboxFilter
          filter={filter}
          value={value as string[] | undefined}
          onChange={onChange}
        />
      );

    case "range":
      return (
        <RangeFilter
          filter={filter}
          value={value as [number, number] | undefined}
          onChange={onChange}
        />
      );

    case "color":
      return (
        <ColorFilter
          filter={filter}
          value={value as string[] | undefined}
          onChange={onChange}
        />
      );

    case "rating":
      return (
        <RatingFilter
          filter={filter}
          value={value as number | undefined}
          onChange={onChange}
        />
      );

    case "select":
      // Single select rendered as radio-style checkboxes
      return (
        <CheckboxFilter
          filter={{ ...filter, show_count: filter.show_count }}
          value={value ? [value as string] : []}
          onChange={(values) => onChange(values[values.length - 1] || undefined)}
        />
      );

    case "boolean":
      return (
        <BooleanFilter
          filter={filter}
          value={value as boolean | undefined}
          onChange={onChange}
        />
      );

    default:
      console.warn(`Unknown filter type: ${filter.type}`);
      return null;
  }
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={i > 0 ? "border-t pt-4" : ""}>
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
