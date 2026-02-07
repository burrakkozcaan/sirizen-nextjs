"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  Share2,
  Grid,
  List,
  SlidersHorizontal,
} from "lucide-react";

import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { ProductCard } from "@/components/product/ProductCard";
import { ShareWishlistModal } from "@/components/favorites/ShareWishlistModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FavoritesPage() {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  const { items, clearFavorites } = useFavorites();
  const { addItem } = useCart();

  const handleAddAllToCart = () => {
    if (items.length === 0) return;

    items.forEach((product) => {
      addItem(product, 1);
    });

    toast.success(`${items.length} ürün sepete eklendi`);
  };

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.price - b.price;
      case "price_high":
        return b.price - a.price;
      case "name":
        return (a.name || '').localeCompare(b.name || '');
      case "discount": {
        const discountA = a.original_price
          ? (a.original_price - a.price) / a.original_price
          : 0;
        const discountB = b.original_price
          ? (b.original_price - b.price) / b.original_price
          : 0;
        return discountB - discountA;
      }
      case "newest":
      default:
        return 0;
    }
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Favorilerim</h1>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Favori listeniz boş</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca
              bulabilirsiniz.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Alışverişe Başla
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalPrice = items.reduce((sum, p) => sum + p.price, 0);
  const totalOriginalPrice = items.reduce(
    (sum, p) => sum + (p.original_price || p.price),
    0
  );
  const totalSavings = totalOriginalPrice - totalPrice;
  const discountPercentage =
    totalOriginalPrice > 0
      ? Math.round((totalSavings / totalOriginalPrice) * 100)
      : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-secondary pb-20 lg:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Heart className="h-7 w-7 fill-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Favorilerim</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-white/90 mt-1">
                  <Badge className="bg-white/20 text-white border-none">
                    {items.length} ürün
                  </Badge>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {formatPrice(totalPrice)}
                  </span>
                  {discountPercentage > 0 && (
                    <Badge className="bg-green-500 text-white border-none">
                      %{discountPercentage} tasarruf
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShareModalOpen(true)}
              className="hidden sm:flex gap-2"
            >
              <Share2 className="h-4 w-4" />
              Listeyi Paylaş
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Actions & Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-card rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShareModalOpen(true)}
              className="sm:hidden gap-2"
            >
              <Share2 className="h-4 w-4" />
              Paylaş
            </Button>
            <Button
              variant="outline"
              onClick={clearFavorites}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Temizle</span>
            </Button>
            <Button onClick={handleAddAllToCart} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Tümünü Sepete Ekle</span>
              <span className="sm:hidden">Sepete</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-background">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeniler</SelectItem>
                <SelectItem value="price_low">Fiyat: Düşük</SelectItem>
                <SelectItem value="price_high">Fiyat: Yüksek</SelectItem>
                <SelectItem value="discount">En Çok İndirim</SelectItem>
                <SelectItem value="name">İsme Göre</SelectItem>
              </SelectContent>
            </Select>
            {/* View Toggle */}
            <div className="hidden sm:flex border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid / List */}
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              : "flex flex-col gap-4"
          )}
        >
          {sortedItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Share Modal */}
      <ShareWishlistModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        items={items}
      />
    </div>
  );
}
