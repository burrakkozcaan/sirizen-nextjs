"use client";

import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import type { Engagement } from "@/actions/pdp.actions";
import { AnimatedSocialProof } from "./AnimatedSocialProof";

interface PDPEngagementClientProps {
  engagement: Engagement;
}

export function PDPEngagementClient({ engagement }: PDPEngagementClientProps) {
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace('.0', '')}B`;
    }
    return count.toString();
  };

  // Animated social proof messages
  const socialProofMessages = [];
  
  if (engagement.purchase_count > 0) {
    const purchaseCount3d = Math.floor(engagement.purchase_count / 30); // Approximate 3-day sales
    if (purchaseCount3d > 0) {
      socialProofMessages.push({
        text: `3 günde ${formatCount(purchaseCount3d)}+ ürün satıldı!`,
        highlight: `${formatCount(purchaseCount3d)}+ ürün`,
        className: "text-green-600",
      });
    }
  }

  if (engagement.view_count > 5000) {
    const viewCount24h = Math.floor(engagement.view_count / 30); // Approximate 24h views
    if (viewCount24h > 0) {
      socialProofMessages.push({
        text: `Son 24 saatte ${formatCount(viewCount24h)} kişi görüntüledi!`,
        highlight: `${formatCount(viewCount24h)} kişi`,
        className: "text-blue-600",
      });
    }
  }

  if (engagement.cart_count > 10000) {
    socialProofMessages.push({
      text: `${formatCount(engagement.cart_count)} kişinin sepetinde!`,
      highlight: `${formatCount(engagement.cart_count)} kişinin`,
      className: "text-orange-600",
    });
  }

  return (
    <div className="space-y-4">
      {/* Animated Social Proof */}
      {socialProofMessages.length > 0 && (
        <div className="border rounded-lg p-3 bg-gradient-to-r from-green-50 to-blue-50 border-green-200/50">
          <AnimatedSocialProof messages={socialProofMessages} interval={3000} />
        </div>
      )}

      {/* Engagement Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="font-semibold">{engagement.view_count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Görüntüleme</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="w-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-semibold">
              {engagement.favorite_count.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Favori</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="font-semibold">
              {engagement.cart_count.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Sepette</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <div>
            <p className="font-semibold">
              {engagement.reviews.average_rating.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              ({engagement.reviews.total} değerlendirme)
            </p>
          </div>
        </div>
      </div>

      {/* Review Distribution */}
      {engagement.reviews.total > 0 && (
        <div className="col-span-2 md:col-span-4 mt-2">
          <div className="flex items-center gap-2 text-xs">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = engagement.reviews.distribution[rating as keyof typeof engagement.reviews.distribution] || 0;
              const percentage = engagement.reviews.total > 0
                ? Math.round((count / engagement.reviews.total) * 100)
                : 0;
              return (
                <div key={rating} className="flex items-center gap-1 flex-1">
                  <span>{rating}⭐</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

