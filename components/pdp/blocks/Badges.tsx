'use client';

import type { Badge } from '@/types/pdp';

interface BadgesProps {
  badges: Badge[];
}

export function Badges({ badges }: BadgesProps) {
  if (!badges || badges.length === 0) return null;

  const getBadgeStyles = (color: string) => {
    const styles: Record<string, string> = {
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return styles[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge.key}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getBadgeStyles(badge.color)}`}
          style={{
            backgroundColor: badge.bg_color,
            color: badge.text_color,
            borderColor: badge.bg_color,
          }}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
