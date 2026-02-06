"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Star,
  Tag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/media";
import { useQuery } from "@tanstack/react-query";
import { getRecommended } from "@/actions/product.actions";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

export default function CartClient() {
  const router = useRouter();
  const {
    items,
    isLoading,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingTotal,
    getDiscountTotal,
    getTotal,
    getItemsByVendor,
    applyCoupon,
    couponCode,
    addItem,
  } = useCart();
  const { isAuthenticated } = useAuth();

  const [couponInput, setCouponInput] = useState("");

  // Fetch recommended products
  const { data: recommendedProducts = [] } = useQuery({
    queryKey: ["recommended-products"],
    queryFn: () => getRecommended(8),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Sepetiniz boş!");
      return;
    }
    
    // Auth kontrolü - eğer giriş yapılmamışsa login'e yönlendir
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      toast.info("Ödeme işlemine devam etmek için giriş yapmanız gerekiyor");
      return;
    }
    
    router.push("/checkout");
  };

  const formatPrice = (price: number | undefined | null) => {
    const numPrice = Number(price) || 0;
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim().toUpperCase());
      toast.success("İndirim uygulandı.", {
        description: `${couponInput
          .trim()
          .toUpperCase()} kuponu başarıyla uygulandı.`,
      });
      setCouponInput("");
    }
  };

  const itemsByVendor = getItemsByVendor();
  const subtotal = getSubtotal();
  const shippingTotal = getShippingTotal();
  const discountTotal = getDiscountTotal();
  const total = getTotal();

  // Show loading state while cart is being loaded from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center mb-12">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Sepetiniz Boş</h1>
            <p className="text-muted-foreground mb-6">
              Sepetinize henüz ürün eklenmemiş. Alışverişe başlamak için ürünleri
              keşfedin.
            </p>
            <Link href="/">
              <Button size="lg">Alışverişe Devam Et</Button>
            </Link>
          </div>

          {/* İlginizi Çekebilir Section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6">İlginizi Çekebilir</h2>
              <div className="w-full overflow-x-auto scrollbar-hide overflow-y-hidden -mx-4 px-4">
                <div className="flex gap-4 min-w-max pb-2">
                  {recommendedProducts.slice(0, 8).map((product: Product) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-[160px] sm:w-[180px]"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">
          Sepetim ({items.length} {items.length === 1 ? "ürün" : "ürün"})
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {Object.entries(itemsByVendor).map(([vendorId, vendorItems]) => {
              // Try multiple ways to get vendor info
              const vendor = vendorItems[0]?.product?.vendor;
              const vendorName = vendor?.name;
              const vendorSlug = vendor?.slug;
              const vendorRating = vendor?.rating;

              return (
                <div
                  key={vendorId}
                  className="bg-white rounded-lg shadow-card overflow-hidden"
                >
                  {/* Vendor Header */}
                  <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
                    {vendorName ? (
                      <Link
                        href={vendorSlug ? `/store/${vendorSlug}` : "#"}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        <span className="font-semibold">
                          {vendorName}
                        </span>
                        {vendorRating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{typeof vendorRating === 'number' ? vendorRating.toFixed(1) : vendorRating}</span>
                          </div>
                        )}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground">
                          Satıcı Bilgisi
                        </span>
                      </div>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      <Truck className="h-3 w-3 mr-1" />
                      {vendorItems.some((i) => i.shipping_type === "free")
                        ? "Ücretsiz Kargo"
                        : "Kargo: 29.99 TL"}
                    </Badge>
                  </div>

                  {/* Items */}
                  <div className="divide-y">
                    {vendorItems.map((item) => (
                      <div key={item.id} className="p-4 flex gap-4">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="flex-shrink-0"
                        >
                          <Image
                            src={
                              item.product.images?.[0]?.url
                                ? resolveMediaUrl(item.product.images[0].url)
                                : "https://placehold.co/100x100"
                            }
                            alt={item.product.name || "Ürün"}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="hover:text-primary"
                          >
                            <h3 className="font-medium line-clamp-2">
                              {item.product.name}
                            </h3>
                          </Link>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Beden: {item.variant.value}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
                            {/* Quantity */}
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Kaldır
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                          </p>
                          {item.original_price &&
                            Number(item.original_price) > Number(item.price) && (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatPrice(
                                  (Number(item.original_price) || 0) * (Number(item.quantity) || 0)
                                )}
                              </p>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-3 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">
                Sipariş Özeti
              </h2>

              {/* Coupon */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Kupon Kodu
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Kupon kodu girin"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    Uygula
                  </Button>
                </div>
                {couponCode && (
                  <div className="mt-2 flex items-center gap-2 text-success text-sm">
                    <Tag className="h-4 w-4" />
                    <span>{couponCode} uygulandı</span>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Ara Toplam
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Kargo
                  </span>
                  <span className={shippingTotal === 0 ? "text-success" : ""}>
                    {shippingTotal === 0
                      ? "Ücretsiz"
                      : formatPrice(shippingTotal)}
                  </span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-success">
                    <span>İndirim</span>
                    <span>-{formatPrice(discountTotal)}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Toplam</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full mt-6"
                disabled={items.length === 0}
                onClick={handleCheckout}
              >
                Ödemeye Geç
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Ödeme adımına geçerek kullanım koşullarını kabul etmiş olursunuz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products Section */}
      {recommendedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-semibold mb-4">Önerilen Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendedProducts.slice(0, 6).map((product: Product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-primary transition-colors cursor-pointer group"
                onClick={() => {
                  addItem(product, 1);
                  toast.success(`${product.title} sepete eklendi`);
                }}
              >
                {product.images?.[0] && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                    <Image
                      src={resolveMediaUrl(
                        product.images[0]?.url || product.images[0]
                      )}
                      alt={product.title || "Ürün"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <h4 className="text-xs font-medium line-clamp-2 mb-2 min-h-[2.5rem]">
                  {product.title}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(product.price || 0)}
                  </span>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

