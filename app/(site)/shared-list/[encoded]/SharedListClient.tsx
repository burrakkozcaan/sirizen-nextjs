"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Mail,
  Send,
  Copy,
  Check,
  Gift,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface SharedListClientProps {
  products: Product[];
  encoded: string;
}

export function SharedListClient({ products, encoded }: SharedListClientProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const { addItem } = useCart();
  const { addFavorite, isFavorite } = useFavorites();

  const handleAddAllToCart = () => {
    products.forEach((product) => {
      addItem(product, 1);
    });
    toast.success(`${products.length} ürün sepete eklendi`);
  };

  const handleAddAllToFavorites = () => {
    let addedCount = 0;
    products.forEach((product) => {
      if (!isFavorite(product.id)) {
        addFavorite(product);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      toast.success(`${addedCount} ürün favorilerinize eklendi`);
    } else {
      toast.info("Tüm ürünler zaten favorilerinizde");
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Bu favori listesine göz at! ${products.length} harika ürün var.`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Link kopyalanamadı");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Paylaşılan Favoriler",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await handleCopyLink();
    }
  };

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    },
    {
      name: "Telegram",
      icon: Send,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "E-posta",
      icon: Mail,
      url: `mailto:?subject=Favori Liste&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    },
  ];

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-secondary pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Liste Bulunamadı</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              Bu favori listesi mevcut değil veya ürünler artık satışta değil.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfaya Dön
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  const totalOriginalPrice = products.reduce(
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
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Gift className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-white/20 text-white border-none">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Paylaşılan Liste
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold">Birinin Favorileri</h1>
              </div>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-4 text-sm md:justify-end">
              <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                <Heart className="h-4 w-4" />
                {products.length} ürün
              </span>
              <span className="bg-white/10 rounded-full px-3 py-1.5">
                {formatPrice(totalPrice)}
              </span>
              {discountPercentage > 0 && (
                <span className="bg-green-500 rounded-full px-3 py-1.5 font-medium">
                  %{discountPercentage} tasarruf
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-card rounded-xl p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold">Favori Ürünler</h2>
            <p className="text-sm text-muted-foreground">
              Bu liste sizinle paylaşıldı
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Share Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Paylaş
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Linki Kopyala
                </DropdownMenuItem>
                {"share" in navigator && (
                  <DropdownMenuItem onClick={handleNativeShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Paylaş...
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {socialLinks.map((social) => (
                  <DropdownMenuItem key={social.name} asChild>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon className="h-4 w-4 mr-2" />
                      {social.name}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add to Favorites */}
            <Button
              variant="outline"
              onClick={handleAddAllToFavorites}
              className="gap-2"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorilere Ekle</span>
            </Button>

            {/* Add All to Cart */}
            <Button onClick={handleAddAllToCart} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Tümünü Sepete Ekle
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Social Share Bar */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 to-secondary rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1">
                Bu listeyi beğendin mi?
              </h3>
              <p className="text-sm text-muted-foreground">
                Arkadaşlarınla paylaş, birlikte alışveriş yapın!
              </p>
            </div>
            <div className="flex gap-2">
              {socialLinks.slice(0, 4).map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110",
                    "bg-muted hover:bg-primary hover:text-primary-foreground"
                  )}
                  title={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-card rounded-xl p-8 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              Kendi favori listenizi oluşturun!
            </h3>
            <p className="text-muted-foreground mb-6">
              Beğendiğiniz ürünleri favorilere ekleyin, listeler oluşturun ve
              arkadaşlarınızla paylaşın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/">Alışverişe Başla</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/favorites">Favorilerime Git</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

