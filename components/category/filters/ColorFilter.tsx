"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { FilterConfig } from "@/types";

interface ColorFilterProps {
  filter: FilterConfig;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export function ColorFilter({ filter, value = [], onChange }: ColorFilterProps) {
  const options = filter.options || [];

  const handleChange = (colorValue: string) => {
    const newValue = value.includes(colorValue)
      ? value.filter(v => v !== colorValue)
      : [...value, colorValue];
    onChange(newValue);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        const hex = option.hex || getColorHex(option.value);
        const isLight = isLightColor(hex);

        return (
          <button
            key={option.value}
            onClick={() => handleChange(option.value)}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
              isSelected ? "border-primary scale-110 shadow-md" : "border-transparent hover:scale-105",
              hex === "#FFFFFF" && "border-gray-200"
            )}
            style={{ backgroundColor: hex }}
            title={`${option.label}${option.count !== undefined ? ` (${option.count})` : ""}`}
          >
            {isSelected && (
              <Check className={cn("h-4 w-4", isLight ? "text-gray-800" : "text-white")} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Default color mappings
function getColorHex(value: string): string {
  const colorMap: Record<string, string> = {
    siyah: "#000000",
    black: "#000000",
    beyaz: "#FFFFFF",
    white: "#FFFFFF",
    kirmizi: "#EF4444",
    red: "#EF4444",
    mavi: "#3B82F6",
    blue: "#3B82F6",
    yesil: "#22C55E",
    green: "#22C55E",
    sari: "#EAB308",
    yellow: "#EAB308",
    turuncu: "#F97316",
    orange: "#F97316",
    mor: "#A855F7",
    purple: "#A855F7",
    pembe: "#EC4899",
    pink: "#EC4899",
    kahverengi: "#92400E",
    brown: "#92400E",
    gri: "#6B7280",
    gray: "#6B7280",
    grey: "#6B7280",
    lacivert: "#1E3A8A",
    navy: "#1E3A8A",
    bej: "#D4B896",
    beige: "#D4B896",
  };

  return colorMap[value.toLowerCase()] || "#9CA3AF";
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
