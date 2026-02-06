"use client";

import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Zap, 
  Trophy, 
  Star, 
  TrendingUp, 
  Clock,
  Package,
  Sparkles
} from "lucide-react";
import type { Badge as BadgeType } from "@/types/pdp-engine";

interface BadgeListProps {
  badges: BadgeType[];
  limit?: number;
  size?: "sm" | "md" | "lg";
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  truck: Truck,
  zap: Zap,
  trophy: Trophy,
  star: Star,
  "trending-up": TrendingUp,
  clock: Clock,
  package: Package,
  sparkles: Sparkles,
};

/**
 * BadgeList - Trendyol-style Product Badges
 * 
 * Otomatik hesaplanan kurallı rozetleri gösterir:
 * - Hızlı Teslimat
 * - Avantajlı Ürün  
 * - Çok Satan
 * - Yeni
 * - vb.
 */
export function BadgeList({ badges, limit = 10, size = "md" }: BadgeListProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  // Priority'e göre sırala (yüksek önce) ve limit uygula
  const sortedBadges = [...badges]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {sortedBadges.map((badge) => {
        const IconComponent = badge.icon ? iconMap[badge.icon] : null;
        
        return (
          <Badge
            key={badge.key}
            variant="secondary"
            className={`font-medium border ${sizeClasses[size]}`}
            style={{
              backgroundColor: badge.bg_color || undefined,
              color: badge.color || undefined,
              borderColor: badge.border_color || badge.color || undefined,
            }}
          >
            {IconComponent && (
              <IconComponent className="w-3 h-3 mr-1" />
            )}
            {badge.label}
          </Badge>
        );
      })}
    </div>
  );
}

/**
 * Compact Badge List - Kart görünümü için
 */
export function CompactBadgeList({ badges }: { badges: BadgeType[] }) {
  if (!badges || badges.length === 0) return null;
  
  const topBadges = badges
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 2);

  return (
    <div className="flex gap-1">
      {topBadges.map((badge) => (
        <span
          key={badge.key}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
          style={{
            backgroundColor: badge.bg_color || "#f3f4f6",
            color: badge.color || "#374151",
          }}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
