"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingCart, Plus, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { getProductBundles, type ProductBundle } from "@/actions/product-bundles.actions";

interface ProductBundlesSectionProps {
  productId: number;
  className?: string;
}

export function ProductBundlesSection({ productId, className }: ProductBundlesSectionProps) {
  const [bundles, setBundles] = useState<ProductBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductBundles(productId)
      .then((data) => {
        if (!cancelled) setBundles(data);
      })
      .catch(() => {
        if (!cancelled) setBundles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [productId]);

  if (loading) return <ProductBundlesSkeleton />;
  if (!bundles || bundles.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {bundles.map((bundle) => (
        <ProductBundleCard key={bundle.id} bundle={bundle} />
      ))}
    </div>
  );
}

function ProductBundleCard({ bundle }: { bundle: ProductBundle }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleAddBundleToCart = async () => {
    setIsAdding(true);
    try {
      // Add all products in bundle to cart
      for (const product of bundle.products) {
        addItem({
          id: product.id,
          name: product.name || product.title || "",
          title: product.name || product.title || "",
          brand: typeof product.brand === "string" ? product.brand : product.brand?.name || "",
          slug: product.slug,
          price: product.price,
          original_price: product.original_price,
          images: product.images,
          vendor_id: product.vendor_id || 0,
          has_free_shipping: product.has_free_shipping || false,
          stock: product.stock || 0,
        } as any);
      }
      toast.success(`${bundle.products.length} ürün sepete eklendi`);
    } catch (error) {
      toast.error("Sepete eklenirken bir hata oluştu");
    } finally {
      setIsAdding(false);
    }
  };

  const getBundleTypeLabel = () => {
    switch (bundle.bundle_type) {
      case "quantity_discount":
        return "Çok Al Az Öde";
      case "set":
        return "Set Ürün";
      case "combo":
        return "Kombinasyon";
      default:
        return "Paket";
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{bundle.title}</h3>
              <Badge className="bg-orange-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                {getBundleTypeLabel()}
              </Badge>
            </div>
            {bundle.discount_rate > 0 && (
              <p className="text-sm text-orange-600 font-semibold mt-1">
                %{bundle.discount_rate} İndirim
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {bundle.products.map((product, index) => (
          <div key={product.id} className="flex items-center gap-2">
            {index > 0 && (
              <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                <Plus className="h-3 w-3 text-white" />
              </div>
            )}
            <Link
              href={`/product/${product.slug}`}
              className="group relative bg-white rounded-lg p-2 border-2 border-transparent hover:border-orange-300 transition-all flex-1"
            >
              <div className="aspect-square relative mb-2 rounded-md overflow-hidden bg-gray-50">
                <Image
                  src={resolveMediaUrl(product.images[0]?.url || "/placeholder.svg")}
                  alt={product.name || product.title || ""}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1">
                  {product.name || product.title}
                </p>
                <p className="text-sm font-bold text-orange-600">
                  {formatPrice(product.price)}
                </p>
                {product.original_price && product.original_price > product.price && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatPrice(product.original_price)}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pricing & Add to Cart */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-orange-200">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-gray-500">Normal Fiyat</p>
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(bundle.total_price)}
              </p>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {formatPrice(bundle.bundle_price)}
            </div>
            {bundle.savings > 0 && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full">
                <p className="text-xs font-semibold">
                  {formatPrice(bundle.savings)} Kazanç
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          size="lg"
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 w-full md:w-auto"
          onClick={handleAddBundleToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <span className="animate-spin">⏳</span>
              Ekleniyor...
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Paketi Sepete Ekle
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ProductBundlesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-xl p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );
}
