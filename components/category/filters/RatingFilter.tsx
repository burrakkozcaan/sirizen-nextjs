"use client";

import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { FilterConfig } from "@/types";

interface RatingFilterProps {
  filter: FilterConfig;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const RATING_OPTIONS = [4, 3, 2, 1];

export function RatingFilter({ filter, value, onChange }: RatingFilterProps) {
  // If filter has custom options, use them
  const options = filter.options?.map(o => Number(o.value)) || RATING_OPTIONS;

  const handleChange = (rating: number, checked: boolean) => {
    onChange(checked ? rating : undefined);
  };

  return (
    <div className="space-y-2">
      {options.map((rating) => (
        <label
          key={rating}
          className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
        >
          <Checkbox
            checked={value === rating}
            onCheckedChange={(checked) => handleChange(rating, checked as boolean)}
          />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">ve üzeri</span>
          </div>
        </label>
      ))}
    </div>
  );
}
