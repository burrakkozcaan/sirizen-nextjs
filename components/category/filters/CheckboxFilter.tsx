"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { FilterConfig } from "@/types";

interface CheckboxFilterProps {
  filter: FilterConfig;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export function CheckboxFilter({ filter, value = [], onChange }: CheckboxFilterProps) {
  const [search, setSearch] = useState("");
  const options = filter.options || [];

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(opt =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter(v => v !== optionValue);
    onChange(newValue);
  };

  const showSearch = options.length > 5;

  return (
    <div className="space-y-2">
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={`${filter.label} ara...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm pl-8"
          />
        </div>
      )}

      <div className="max-h-48 overflow-y-auto space-y-1.5">
        {filteredOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Sonuç bulunamadı</p>
        ) : (
          filteredOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
            >
              <Checkbox
                checked={value.includes(option.value)}
                onCheckedChange={(checked) => handleChange(option.value, checked as boolean)}
              />
              <span className="text-sm flex-1 truncate">{option.label}</span>
              {filter.show_count && option.count !== undefined && (
                <span className="text-xs text-muted-foreground">({option.count})</span>
              )}
            </label>
          ))
        )}
      </div>
    </div>
  );
}
