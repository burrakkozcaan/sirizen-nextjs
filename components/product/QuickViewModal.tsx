"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Truck, ShieldCheck, Minus, Plus, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import type { Product, ProductVariant } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { resolveMediaUrl } from '@/lib/media';

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!product) return null;
  
  // Ensure images array exists
  const images = product.images || [];
  const currentImage = images[selectedImage] || images[0] || null;

  const isFav = isFavorite(product.id);
  const currentPrice = selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant?.original_price ?? product.original_price;

  // Handle brand (can be string or object)
  const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name || '';
  const brandSlug = product.brand_slug || (typeof product.brand === 'object' ? product.brand?.slug : '');
  const brandLogo = typeof product.brand === 'object' ? product.brand?.logo : undefined;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant || undefined);
    toast.success('Sepete eklendi');
    onOpenChange(false);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden [&>button]:hidden">
        {/* Kapatma butonu - çarpı */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-background/90 shadow-md hover:bg-background border"
          onClick={() => onOpenChange(false)}
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </Button>
        <DialogHeader className="sr-only">
          <DialogTitle>
            {product.name || product.title} - Hızlı Bakış
          </DialogTitle>
          <DialogDescription>
            Ürün detaylarını hızlıca görüntüleyin
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative bg-muted">
            <div className="aspect-square">
              <img
                src={currentImage?.url || 'https://placehold.co/500x500'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-sm"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-sm"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Image Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      selectedImage === index ? 'bg-primary' : 'bg-white/60'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
              {product.discount_percentage && product.discount_percentage > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  %{product.discount_percentage}
                </Badge>
              )}
              {product.is_bestseller && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Çok Satan
                </Badge>
              )}
              {product.is_new && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Yeni
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="p-6 flex flex-col max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-4">
              {brandName && (
                <Link 
                  href={brandSlug ? `/marka/${brandSlug}` : '#'}
                  className="text-sm font-semibold text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  {brandName}
                </Link>
              )}
              <h2 className="text-xl font-bold mt-1">{product.name || product.title}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {Number(product.rating || 0).toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({(product.review_count || product.review_count || 0).toLocaleString('tr-TR')} değerlendirme)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-secondary/50 rounded-lg p-4 mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-primary">{formatPrice(currentPrice)}</span>
                {originalPrice && originalPrice > currentPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              {product.discount_percentage && (
                <p className="text-sm text-success font-medium mt-1">
                  %{product.discount_percentage} indirim fırsatını kaçırma!
                </p>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Beden Seçimi</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={cn(
                        'min-w-[48px]',
                        variant.stock === 0 && 'opacity-50 line-through'
                      )}
                    >
                      {variant.value}
                    </Button>
                  ))}
                </div>
                {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < 10 && (
                  <p className="text-sm text-destructive mt-2">
                    Son {selectedVariant.stock} ürün!
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Adet</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex gap-2">
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  Sepete Ekle
                </Button>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => toggleFavorite(product)}
                    className={cn(isFav && 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100')}
                  >
                    <Heart className={cn('h-5 w-5', isFav && 'fill-red-500')} />
                  </Button>
                  {/* Brand Link - Eye icon below favorite button */}
                  {brandSlug && (
                    <Link
                      href={`/marka/${brandSlug}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center justify-center w-12 h-12 rounded border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                      title={brandName || 'Marka Sayfası'}
                    >
                      <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-2 pt-4 border-t">
              {product.has_free_shipping && (
                <div className="flex items-center gap-2 text-success text-sm">
                  <Truck className="h-4 w-4" />
                  <span className="font-medium">Ücretsiz Kargo</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>Güvenli Alışveriş</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tahmini Teslimat: {product.shipping_time}
              </p>
            </div>

            {/* View Full Details */}
            <Link
              href={`/product/${product.slug}`}
              onClick={() => onOpenChange(false)}
              className="mt-4 text-center text-primary hover:underline text-sm font-medium flex items-center justify-center gap-1"
            >
              <Eye className="h-4 w-4" />
              Tüm Ürün Detaylarını Gör
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
