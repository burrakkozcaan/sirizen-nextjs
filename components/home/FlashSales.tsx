"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Zap, Clock, ChevronRight, Flame } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock product type
interface MockProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  discount_percentage?: number;
  image?: string;
  rating?: number;
  review_count?: number;
  vendor?: {
    name: string;
  };
}

// Mock data
const mockProducts: MockProduct[] = [
  { id: 1, name: "Kablosuz Kulaklık", slug: "kablosuz-kulaklik", price: 1299, discount_price: 899, discount_percentage: 31, rating: 4.5, review_count: 128 },
  { id: 2, name: "Akıllı Saat", slug: "akilli-saat", price: 2499, discount_price: 1499, discount_percentage: 40, rating: 4.3, review_count: 89 },
  { id: 3, name: "Bluetooth Hoparlör", slug: "bluetooth-hoparlor", price: 899, discount_price: 599, discount_percentage: 33, rating: 4.7, review_count: 256 },
  { id: 4, name: "Powerbank 20000mAh", slug: "powerbank-20000mah", price: 599, discount_price: 399, discount_percentage: 33, rating: 4.4, review_count: 67 },
  { id: 5, name: "Laptop Standı", slug: "laptop-standi", price: 449, discount_price: 299, discount_percentage: 33, rating: 4.6, review_count: 145 },
  { id: 6, name: "Mekanik Klavye", slug: "mekanik-klavye", price: 1899, discount_price: 1299, discount_percentage: 32, rating: 4.8, review_count: 312 },
  { id: 7, name: "Gaming Mouse", slug: "gaming-mouse", price: 799, discount_price: 499, discount_percentage: 38, rating: 4.5, review_count: 178 },
  { id: 8, name: "Webcam 1080p", slug: "webcam-1080p", price: 999, discount_price: 699, discount_percentage: 30, rating: 4.2, review_count: 94 },
];

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function CountdownTimer({ endTime }: { endTime: Date }) {
  const calculateTimeLeft = useCallback((): TimeLeft => {
    const difference = endTime.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24) + Math.floor(difference / (1000 * 60 * 60 * 24)) * 24,
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      <TimeBlock value={formatNumber(timeLeft.hours)} label="saat" />
      <span className="text-xl font-bold text-primary-foreground animate-pulse">:</span>
      <TimeBlock value={formatNumber(timeLeft.minutes)} label="dk" />
      <span className="text-xl font-bold text-primary-foreground animate-pulse">:</span>
      <TimeBlock value={formatNumber(timeLeft.seconds)} label="sn" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-foreground/90 text-background rounded-md px-2 py-1 min-w-[40px] text-center">
        <span className="text-lg sm:text-xl font-bold font-mono">{value}</span>
      </div>
      <span className="text-[10px] text-primary-foreground/80 mt-0.5">{label}</span>
    </div>
  );
}

interface FlashDeal {
  product: MockProduct;
  soldPercentage: number;
  originalStock: number;
}

export function FlashSales() {
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);

  // Create flash deals from products with discounts - useEffect to avoid prerender issues
  useEffect(() => {
    const deals: FlashDeal[] = mockProducts
      .filter(p => p.discount_percentage && p.discount_percentage >= 20)
      .slice(0, 8)
      .map(product => ({
        product,
        soldPercentage: Math.floor(Math.random() * 60) + 30, // 30-90% sold
        originalStock: Math.floor(Math.random() * 100) + 50,
      }));
    setFlashDeals(deals);
  }, []);

  // End time is 6 hours from now - calculate after mount to avoid prerender issues
  const [endTime, setEndTime] = useState<Date | null>(null);
  
  useEffect(() => {
    setEndTime(new Date(Date.now() + 6 * 60 * 60 * 1000));
  }, []);

  // Demo: Show flash sale notification after 3 seconds (only once per session)
  useEffect(() => {
    const hasShownDemo = sessionStorage.getItem('demo-notification-shown');
    if (!hasShownDemo) {
      const timer = setTimeout(() => {
        toast.success('Flaş İndirim Başladı!', {
          description: '%50\'ye varan indirimler sınırlı süreyle devam ediyor. Kaçırmayın!',
          duration: 5000,
        });
        sessionStorage.setItem('demo-notification-shown', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Convert mock product to ProductCard expected format
  const convertToProductCard = (p: MockProduct) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    discount_price: p.discount_price,
    discount_percentage: p.discount_percentage,
    primary_image: p.image || "/images/placeholder.jpg",
    rating: p.rating,
    review_count: p.review_count,
    vendor: p.vendor || { name: "Sirizen" },
  });

  return (
    <section className="py-1">
      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-r from-primary via-primary to-destructive rounded-xl p-4 sm:p-6 mb-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
              <Zap className="h-6 w-6 text-primary-foreground" fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground">
                  Flaş İndirimler
                </h2>
                <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0">
                  <Flame className="h-3 w-3 mr-1" />
                  Sınırlı Süre
                </Badge>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Kaçırmayın! Stoklar tükenmeden alın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Bitmesine:</span>
            </div>
            {endTime && <CountdownTimer endTime={endTime} />}
          </div>
        </div>
      </div>

  
    </section>
  );
}
