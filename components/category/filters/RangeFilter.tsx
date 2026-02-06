"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { FilterConfig } from "@/types";

interface RangeFilterProps {
  filter: FilterConfig;
  value: [number, number] | undefined;
  onChange: (value: [number, number] | undefined) => void;
}

export function RangeFilter({ filter, value, onChange }: RangeFilterProps) {
  const min = filter.min ?? 0;
  const max = filter.max ?? 10000;
  const step = filter.step ?? 10;
  const unit = filter.unit ?? "";

  const [localValue, setLocalValue] = useState<[number, number]>([
    value?.[0] ?? min,
    value?.[1] ?? max,
  ]);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue([value?.[0] ?? min, value?.[1] ?? max]);
  }, [value, min, max]);

  const handleSliderChange = (values: number[]) => {
    setLocalValue([values[0], values[1]]);
  };

  const handleInputChange = (index: 0 | 1, inputValue: string) => {
    const numValue = Number(inputValue) || (index === 0 ? min : max);
    const clampedValue = Math.max(min, Math.min(max, numValue));
    const newValue: [number, number] = [...localValue] as [number, number];
    newValue[index] = clampedValue;

    // Ensure min <= max
    if (index === 0 && newValue[0] > newValue[1]) {
      newValue[1] = newValue[0];
    } else if (index === 1 && newValue[1] < newValue[0]) {
      newValue[0] = newValue[1];
    }

    setLocalValue(newValue);
  };

  const applyFilter = () => {
    // Only apply if values differ from default
    if (localValue[0] === min && localValue[1] === max) {
      onChange(undefined);
    } else {
      onChange(localValue);
    }
  };

  const isChanged = localValue[0] !== (value?.[0] ?? min) || localValue[1] !== (value?.[1] ?? max);
  const hasFilter = value !== undefined;

  return (
    <div className="space-y-4">
      <Slider
        value={localValue}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
        className="py-4"
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            value={localValue[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            onBlur={applyFilter}
            className="h-8 text-sm pr-8"
            min={min}
            max={max}
          />
          {unit && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        <span className="text-muted-foreground">-</span>
        <div className="relative flex-1">
          <Input
            type="number"
            value={localValue[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            onBlur={applyFilter}
            className="h-8 text-sm pr-8"
            min={min}
            max={max}
          />
          {unit && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
      </div>

      <Button
        size="sm"
        onClick={applyFilter}
        className="w-full"
        disabled={!isChanged && !hasFilter}
      >
        {hasFilter ? "Güncelle" : "Uygula"}
      </Button>
    </div>
  );
}
