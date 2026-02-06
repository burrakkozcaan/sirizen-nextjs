"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  TrendingDown,
  Zap,
  Utensils,
  Tv,
  Shirt,
  Armchair,
  Sparkles,
  ShoppingBag,
  Baby,
  Dumbbell,
  Gift,
} from "lucide-react";
import type { QuickLink as QuickLinkType } from "@/types";
import { api } from "@/lib/api";

// KEY-based icon map (matches Filament Select options)
export const quickLinkIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  trending_down: TrendingDown,
  zap: Zap,
  utensils: Utensils,
  tv: Tv,
  shirt: Shirt,
  armchair: Armchair,
  sparkles: Sparkles,
  shopping_bag: ShoppingBag,
  baby: Baby,
  dumbbell: Dumbbell,
  gift: Gift,
};

// Theme-based color map
export const quickLinkColors: Record<string, string> = {
  danger: "bg-red-100 text-red-600",
  warning: "bg-yellow-100 text-yellow-600",
  primary: "bg-primary/10 text-primary",
  info: "bg-blue-100 text-blue-600",
  success: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
};

// Label KEY → Display Text map (matches Filament Select options)
export const quickLinkLabels: Record<string, string> = {
  price_drops: "Fiyatı Düşenler",
  super_deals: "Süper Fırsatlar",
  food: "Yiyecek",
  electronics: "Elektronik",
  fashion: "Moda",
  home_living: "Ev & Yaşam",
  cosmetics: "Kozmetik",
  shoes_bags: "Ayakkabı & Çanta",
  mother_baby: "Anne & Bebek",
  sports: "Spor",
  points: "Puan",
  custom: "Özel",
};

// Type-safe icon key
export type QuickLinkIconKey = keyof typeof quickLinkIcons;

export function QuickLinks() {
  const [links, setLinks] = useState<QuickLinkType[]>([]);

  useEffect(() => {
    let isMounted = true;

    api
      .get<QuickLinkType[]>("/quick-links")
      .then((data) => {
        if (!isMounted) return;

        // API wraps in { data: QuickLink[] } for server helpers, but client api.ts returns raw JSON.
        const resolved =
          Array.isArray((data as any).data) ? (data as any).data : data;

        setLinks(resolved);
      })
      .catch(() => {
        // Hata olursa bir şey göstermeyelim, sadece sessizce fail.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!links.length) {
    return null;
  }

  return (
    <section className="py-3 px-2 md:px-4">
      <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1">
        {links.map(
          ({
            id,
            key,
            icon,
            path,
            color,
            label,
            category_slug,
            campaign_slug,
            product_id,
          }) => {
          // Get icon component from KEY (icon field from backend)
          const iconKey = (icon || key) as QuickLinkIconKey;
          const IconComponent = quickLinkIcons[iconKey] ?? Gift;

          // Get color class from theme (color field from backend)
          const colorClass = quickLinkColors[color ?? "primary"] ?? quickLinkColors.primary;

          // Get display label from KEY (label field from backend)
          const displayLabel = quickLinkLabels[label ?? key] ?? label ?? key;

          // Build href from path or relational fields
          const href =
            path ||
            (category_slug
              ? `/category/${category_slug}`
              : campaign_slug
              ? `/campaign/${campaign_slug}`
              : product_id
              ? `/product/${product_id}`
              : "#");

          return (
            <Link
              key={id ?? key}
              href={href}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors min-w-[80px]"
            >
              <div
                className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-center whitespace-nowrap">
                {displayLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
