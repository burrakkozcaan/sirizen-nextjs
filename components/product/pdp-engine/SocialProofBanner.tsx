"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Eye, 
  ShoppingCart, 
  PackageCheck,
  TrendingUp
} from "lucide-react";
import type { SocialProofData } from "@/types/pdp-engine";

interface SocialProofBannerProps {
  data: SocialProofData;
  animate?: boolean;
}

const iconMap = {
  cart_count: ShoppingCart,
  view_count: Eye,
  sold_count: PackageCheck,
  review_count: Users,
};

/**
 * SocialProofBanner - Sosyal Kanıt Banner'ı
 * 
 * Trendyol'daki "3.2B kişinin sepetinde", "Son 24 saatte 28B görüntüleme"
 * gibi sosyal kanıt mesajlarını gösterir.
 */
export function SocialProofBanner({ data, animate = true }: SocialProofBannerProps) {
  const [displayMessage, setDisplayMessage] = useState(data.message);
  const IconComponent = iconMap[data.type] || TrendingUp;

  // Periyodik güncelleme (refresh_interval'e göre)
  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      // Sayıyı hafifçe değiştir (gerçek zamanlı hissiyat için)
      const match = data.message.match(/([\d.,]+[KM]?)/);
      if (match) {
        const originalNumber = match[0];
        // Rastgele ±%5 değişim
        const variation = (Math.random() - 0.5) * 0.1;
        // Bu sadece görsel efekt, gerçek veri değil
        // Gerçek uygulamada API'den yenilenmiş veri alınmalı
      }
    }, data.refresh_interval * 1000);

    return () => clearInterval(interval);
  }, [data, animate]);

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-500"
      style={{
        backgroundColor: data.color ? `${data.color}15` : "#ecfdf5",
        color: data.color || "#059669",
      }}
    >
      <IconComponent className="w-4 h-4" />
      <span>{displayMessage}</span>
    </div>
  );
}

/**
 * Skeleton loader for social proof
 */
export function SocialProofSkeleton() {
  return (
    <div className="h-9 w-48 bg-gray-100 rounded-lg animate-pulse" />
  );
}
