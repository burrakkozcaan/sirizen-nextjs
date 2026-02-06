"use client";

import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import type { FilterConfig } from "@/types";

interface BooleanFilterProps {
  filter: FilterConfig;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  variant?: "switch" | "checkbox";
}

export function BooleanFilter({
  filter,
  value = false,
  onChange,
  variant = "checkbox",
}: BooleanFilterProps) {
  if (variant === "switch") {
    return (
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm">{filter.label}</span>
        <Switch checked={value} onCheckedChange={onChange} />
      </label>
    );
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors">
      <Checkbox checked={value} onCheckedChange={(checked) => onChange(checked as boolean)} />
      <span className="text-sm">{filter.label}</span>
    </label>
  );
}
