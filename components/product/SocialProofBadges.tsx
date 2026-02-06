import { ShoppingCart, Eye, TrendingUp, Flame, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialProofBadgesProps {
  cartCount?: number;
  viewCount24h?: number;
  soldCount3d?: number;
  className?: string;
}

export function SocialProofBadges({
  cartCount = 36600,
  viewCount24h = 16000,
  soldCount3d = 10000,
  className
}: SocialProofBadgesProps) {
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace('.0', '')}B`;
    }
    return count.toString();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* In cart badge */}
      <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
        <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
          <ShoppingCart className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-900">
            <span className="font-bold text-orange-600">{formatCount(cartCount)}</span> kişinin sepetinde, 
            <span className="text-orange-700 font-semibold"> tükenmeden al!</span>
          </p>
        </div>
        <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
      </div>

      {/* Popular product badge */}
      <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
        <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
          <Eye className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-semibold text-purple-700">Popüler ürün!</span>
            <span className="text-purple-900"> Son 24 saatte </span>
            <span className="font-bold text-purple-600">{formatCount(viewCount24h)}</span>
            <span className="text-purple-900"> kişi görüntüledi!</span>
          </p>
        </div>
        <TrendingUp className="h-5 w-5 text-purple-500" />
      </div>

      {/* Sales badge */}
      <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-green-900">
            <span className="font-semibold">3 günde </span>
            <span className="font-bold text-green-600">{formatCount(soldCount3d)}+</span>
            <span className="font-semibold"> ürün satıldı!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
