"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Zap, Clock, ChevronRight, Flame } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Product } from "@/types";

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
      hours:
        Math.floor((difference / (1000 * 60 * 60)) % 24) +
        Math.floor(difference / (1000 * 60 * 60 * 24)) * 24,
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

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1">
      <TimeBlock value={formatNumber(timeLeft.hours)} label="saat" />
      <span className="text-xl font-bold text-primary-foreground animate-pulse">
        :
      </span>
      <TimeBlock value={formatNumber(timeLeft.minutes)} label="dk" />
      <span className="text-xl font-bold text-primary-foreground animate-pulse">
        :
      </span>
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
      <span className="text-[10px] text-primary-foreground/80 mt-0.5">
        {label}
      </span>
    </div>
  );
}

interface FlashDeal {
  product: Product;
  soldPercentage: number;
  originalStock: number;
}

export function FlashSalesSection() {
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ data: Product[] }>("/products/flash-sales?limit=8");
        const products = response.data || [];
        
        const deals: FlashDeal[] = products
          .filter((p) => p.discount_percentage && p.discount_percentage >= 20)
          .slice(0, 8)
          .map((product) => ({
            product,
            // Use product ID as seed for deterministic randomness
            soldPercentage: Math.floor(((product.id * 17) % 60) + 30), // 30-90% sold
            originalStock: Math.floor(((product.id * 23) % 100) + 50),
          }));
        
        setFlashDeals(deals);
      } catch {
        // Endpoint may not exist yet - silently fail
        setFlashDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  // End time is 6 hours from now - calculate after mount to avoid prerender issues
  const [endTime, setEndTime] = useState<Date | null>(null);
  
  useEffect(() => {
    setEndTime(new Date(Date.now() + 6 * 60 * 60 * 1000));
  }, []);

  if (loading) {
    return (
      <section className="py-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg animate-pulse h-[300px]" />
          ))}
        </div>
      </section>
    );
  }

  if (flashDeals.length === 0) {
    return null;
  }

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
              <Zap
                className="h-6 w-6 text-primary-foreground"
                fill="currentColor"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground">
                  Flaş İndirimler
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-primary-foreground border-0"
                >
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

      {/* Flash Deal Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {flashDeals.map(({ product, soldPercentage }) => (
          <div key={product.id} className="relative group">
            <ProductCard product={product} />

            {/* Stock Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm p-2 rounded-b-lg border-t">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Satıldı</span>
                  {soldPercentage >= 70 && (
                    <span className="text-[10px] text-destructive font-medium flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      Tükenmek üzere!
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "font-medium",
                    soldPercentage >= 70 ? "text-destructive" : "text-primary"
                  )}
                >
                  %{soldPercentage}
                </span>
              </div>
              <Progress
                value={soldPercentage}
                className={cn(
                  "h-1.5",
                  soldPercentage >= 70 && "[&>div]:bg-destructive"
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-6">
        <Button variant="default" size="lg" className="group bg-gradient-to-r from-primary to-destructive hover:from-primary/90 hover:to-destructive/90" asChild>
          <Link href="/campaign/flash-sales">
            <Zap className="h-4 w-4 mr-2" fill="currentColor" />
            Tüm Flaş İndirimleri Gör
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
