"use client";

import { 
  Star, 
  Truck, 
  Package, 
  Clock, 
  ThumbsUp,
  TrendingUp,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import type { Vendor } from '@/types';
import { cn } from '@/lib/utils';

interface SellerRatingPopupProps {
  vendor: Vendor;
  children: React.ReactNode;
}

export function SellerRatingPopup({ vendor, children }: SellerRatingPopupProps) {
  // Mock detailed stats
  const stats = {
    productQuality: 4.8,
    shipping: 4.6,
    packaging: 4.7,
    communication: 4.5,
    onTimeDelivery: 96,
    positiveReviews: 98,
    responseRate: 95,
    avgResponseTime: '2 saat',
    totalOrders: 125000,
    returnRate: 2.3,
  };

  const ratingCategories = [
    { label: 'Ürün Kalitesi', value: stats.productQuality, icon: Package },
    { label: 'Kargo Hızı', value: stats.shipping, icon: Truck },
    { label: 'Paketleme', value: stats.packaging, icon: Award },
    { label: 'İletişim', value: stats.communication, icon: ThumbsUp },
  ];

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-0" 
        side="bottom" 
        align="start"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-white border flex items-center justify-center overflow-hidden">
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  {vendor.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{vendor.name}</span>
                {vendor.is_official && (
                  <ShieldCheck className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-sm font-semibold">{Number(vendor.rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {vendor.review_count.toLocaleString()} değerlendirme
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Categories */}
        <div className="p-4 space-y-3">
          {ratingCategories.map((cat) => (
            <div key={cat.label} className="flex items-center gap-3">
              <cat.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{cat.label}</span>
                  <span className="text-xs font-medium">{cat.value.toFixed(1)}</span>
                </div>
                <Progress value={cat.value * 20} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">Zamanında Teslimat</span>
              </div>
              <span className="text-sm font-semibold text-green-600">%{stats.onTimeDelivery}</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <ThumbsUp className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-muted-foreground">Olumlu Yorum</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">%{stats.positiveReviews}</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Clock className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">Yanıt Süresi</span>
              </div>
              <span className="text-sm font-semibold">{stats.avgResponseTime}</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Package className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">Toplam Sipariş</span>
              </div>
              <span className="text-sm font-semibold">{(stats.totalOrders / 1000).toFixed(0)}B+</span>
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="px-4 pb-4">
          <Badge 
            variant="secondary" 
            className="w-full justify-center py-1.5 bg-primary/5 text-primary hover:bg-primary/10"
          >
            <ShieldCheck className="h-3 w-3 mr-1" />
            {vendor.years_on_platform} Yıldır Platformda
          </Badge>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
