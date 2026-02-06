"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Zap, Clock, Flame, ChevronLeft, Filter, ArrowUpDown } from "lucide-react";
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
      <span className="text-2xl font-bold text-white animate-pulse">:</span>
      <TimeBlock value={formatNumber(timeLeft.minutes)} label="dk" />
      <span className="text-2xl font-bold text-white animate-pulse">:</span>
      <TimeBlock value={formatNumber(timeLeft.seconds)} label="sn" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm text-white rounded-lg px-3 py-2 min-w-[50px] text-center border border-white/30">
        <span className="text-2xl sm:text-3xl font-bold font-mono">{value}</span>
      </div>
      <span className="text-xs text-white/80 mt-1">{label}</span>
    </div>
  );
}

interface FlashDeal {
  product: Product;
  soldPercentage: number;
}

type SortOption = "discount" | "price_asc" | "price_desc" | "popular";

export default function FlashSalesPage() {
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("discount");
  const [endTime] = useState<Date>(() => new Date(Date.now() + 6 * 60 * 60 * 1000));

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ data: Product[] }>("/products/flash-sales?limit=50");
        const products = response.data || [];

        const deals: FlashDeal[] = products
          .filter((p) => p.discount_percentage && p.discount_percentage >= 15)
          .map((product) => ({
            product,
            soldPercentage: Math.floor(((product.id * 17) % 60) + 30),
          }));

        setFlashDeals(deals);
      } catch {
        // Fallback: fetch regular products with discount
        try {
          const response = await api.get<{ data: Product[] }>("/products?has_discount=true&per_page=50");
          const products = response.data || [];

          const deals: FlashDeal[] = products
            .filter((p) => p.discount_percentage && p.discount_percentage >= 15)
            .map((product) => ({
              product,
              soldPercentage: Math.floor(((product.id * 17) % 60) + 30),
            }));

          setFlashDeals(deals);
        } catch {
          setFlashDeals([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  // Sort deals
  const sortedDeals = [...flashDeals].sort((a, b) => {
    switch (sortBy) {
      case "discount":
        return (b.product.discount_percentage || 0) - (a.product.discount_percentage || 0);
      case "price_asc":
        return a.product.price - b.product.price;
      case "price_desc":
        return b.product.price - a.product.price;
      case "popular":
        return b.soldPercentage - a.soldPercentage;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-bounce" />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Ana Sayfa
          </Link>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                <Zap className="h-8 w-8 text-white" fill="currentColor" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">
                    Flaş İndirimler
                  </h1>
                  <Badge className="bg-white/20 text-white border-0 text-sm">
                    <Flame className="h-4 w-4 mr-1" />
                    Sınırlı Süre
                  </Badge>
                </div>
                <p className="text-white/80 text-lg mt-1">
                  Kaçırmayın! Stoklar tükenmeden alın.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Kampanya Bitimine:</span>
              </div>
              <CountdownTimer endTime={endTime} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="font-medium">{sortedDeals.length} ürün</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="discount">En Yüksek İndirim</option>
                <option value="price_asc">En Düşük Fiyat</option>
                <option value="price_desc">En Yüksek Fiyat</option>
                <option value="popular">En Popüler</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg animate-pulse h-[350px]" />
            ))}
          </div>
        ) : sortedDeals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedDeals.map(({ product, soldPercentage }) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />

                {/* Stock Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-2 rounded-b-lg border-t">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Satıldı</span>
                      {soldPercentage >= 70 && (
                        <span className="text-[10px] text-red-500 font-medium flex items-center gap-0.5">
                          <Flame className="h-3 w-3" />
                          Tükeniyor!
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-semibold",
                        soldPercentage >= 70 ? "text-red-500" : "text-orange-500"
                      )}
                    >
                      %{soldPercentage}
                    </span>
                  </div>
                  <Progress
                    value={soldPercentage}
                    className={cn(
                      "h-1.5",
                      soldPercentage >= 70 ? "[&>div]:bg-red-500" : "[&>div]:bg-orange-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Şu an aktif flaş indirim yok
            </h3>
            <p className="text-gray-500 mb-6">
              Yeni flaş indirimler için takipte kalın!
            </p>
            <Button asChild>
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Anlık İndirimler</h4>
                <p className="text-sm text-gray-500">Sınırlı süre, sınırlı stok</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">%70'e Varan İndirim</h4>
                <p className="text-sm text-gray-500">En yüksek indirim oranları</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Her Gün Yenilenir</h4>
                <p className="text-sm text-gray-500">Yeni fırsatlar için takipte kalın</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
