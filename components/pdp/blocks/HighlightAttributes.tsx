'use client';

import { Check } from 'lucide-react';
import type { HighlightAttribute } from '@/types/pdp';

interface HighlightAttributesProps {
  highlights: HighlightAttribute[];
}

export function HighlightAttributes({ highlights }: HighlightAttributesProps) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Öne Çıkan Özellikler</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
            style={highlight.color ? { borderLeft: `3px solid ${highlight.color}` } : undefined}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: highlight.color || '#e5e7eb' }}
            >
              <Check className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{highlight.label}</p>
              <p className="text-sm font-medium text-gray-900">
                {highlight.display_value || highlight.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
