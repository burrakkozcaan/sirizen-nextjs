"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RelatedTagsProps {
  tags: string[];
  categoryName?: string;
  className?: string;
}

export function RelatedTags({ tags, categoryName, className }: RelatedTagsProps) {
  if (!tags || tags.length === 0) return null;

  // Generate related search terms based on product tags and category
  const relatedTerms = [
    ...tags,
    categoryName && `${categoryName} modelleri`,
    categoryName && `En iyi ${categoryName}`,
    categoryName && `${categoryName} fiyatları`,
  ].filter(Boolean) as string[];

  // Take unique terms
  const uniqueTerms = [...new Set(relatedTerms)].slice(0, 20);

  return (
    <div className={cn('bg-white rounded-lg shadow-card p-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Bunlar da İlginizi Çekebilir</h3>
      <div className="flex flex-wrap gap-2">
        {uniqueTerms.map((term, index) => (
          <Link
            key={index}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="inline-flex items-center px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-sm text-foreground rounded-full border border-border hover:border-primary/30 transition-colors"
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}
