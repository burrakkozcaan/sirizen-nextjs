"use client";

import { Sparkles } from "lucide-react";
import type { HighlightAttributeValue } from "@/types/pdp-engine";

interface HighlightAttributesProps {
  highlights: HighlightAttributeValue[];
  variant?: "pills" | "list" | "cards";
}

/**
 * HighlightAttributes - Öne Çıkan Ürün Özellikleri
 * 
 * Trendyol'daki sarı/beyaz kutucuklu özellikler:
 * - "Pamuklu"
 * - "Suya Dayanıklı" 
 * - "Hafif"
 * vb.
 */
export function HighlightAttributes({ 
  highlights, 
  variant = "pills" 
}: HighlightAttributesProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  if (variant === "pills") {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Öne Çıkan Özellikler
        </h3>
        <div className="flex flex-wrap gap-2">
          {highlights.map((highlight, index) => (
            <div
              key={`${highlight.key}-${index}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: highlight.color 
                  ? `${highlight.color}15` 
                  : "#fef3c7",
                color: highlight.color || "#92400e",
              }}
            >
              {highlight.icon ? (
                <span className="text-xs">{highlight.icon}</span>
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{highlight.display_value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Öne Çıkan Özellikler
        </h3>
        <ul className="space-y-2">
          {highlights.map((highlight, index) => (
            <li 
              key={`${highlight.key}-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              <span 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: highlight.color || "#f59e0b" }}
              />
              <span className="font-medium">{highlight.label}:</span>
              <span className="text-muted-foreground">
                {highlight.display_value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {highlights.map((highlight, index) => (
          <div
            key={`${highlight.key}-${index}`}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ 
                backgroundColor: highlight.color 
                  ? `${highlight.color}20` 
                  : "#fef3c7" 
              }}
            >
              {highlight.icon || "✨"}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{highlight.label}</p>
              <p className="font-medium text-sm">{highlight.display_value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
