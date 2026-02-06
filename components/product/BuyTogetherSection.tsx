"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  brand?: string;
  price: number;
  original_price?: number;
  images: Array<{ id: number; url: string; alt?: string }>;
}

interface BuyTogetherSectionProps {
  mainProduct: Product;
  suggestedProducts: Product[];
  className?: string;
}

export function BuyTogetherSection({ mainProduct, suggestedProducts, className }: BuyTogetherSectionProps) {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([mainProduct.id]);
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const toggleProduct = (productId: number) => {
    if (productId === mainProduct.id) return;
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const allProducts = [mainProduct, ...suggestedProducts.slice(0, 2)];
  const selectedItems = allProducts.filter(p => selectedProducts.includes(p.id));
  const totalPrice = selectedItems.reduce((sum, p) => sum + p.price, 0);
  const totalOriginalPrice = selectedItems.reduce((sum, p) => sum + (p.original_price || p.price), 0);

  const handleAddToCart = () => {
    selectedItems.forEach((product) => {
      addItem({
        id: product.id,
        name: product.name,
        title: product.name,
        brand: product.brand,
        slug: `product-${product.id}`,
        price: product.price,
        original_price: product.original_price,
        images: product.images,
        vendor_id: 0,
        has_free_shipping: false,
        stock: 100,
      } as any);
    });
    toast.success(`${selectedItems.length} ürün sepete eklendi`);
  };

  if (suggestedProducts.length === 0) return null;

  return (
    <div className={cn('bg-card rounded-xl border p-4 md:p-6', className)}>
      <h2 className="text-lg font-semibold mb-4">Birlikte Al</h2>
      
      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {/* Products Grid */}
        <div className="flex items-center justify-center gap-2">
          {allProducts.map((product, index) => (
            <div key={product.id} className="flex items-center gap-1">
              {index > 0 && (
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="h-3 w-3 text-primary" />
                </div>
              )}
              
              <div 
                className={cn(
                  'relative p-2 border-2 rounded-lg cursor-pointer transition-all',
                  selectedProducts.includes(product.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted/30'
                )}
                onClick={() => toggleProduct(product.id)}
              >
                <div className="absolute -top-1 -right-1 z-10">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    disabled={product.id === mainProduct.id}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="w-16 h-16 rounded-md overflow-hidden bg-white relative">
                  <Image
                    src={resolveMediaUrl(product.images[0]?.url || '/placeholder.svg')}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                
                {product.id === mainProduct.id && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-[10px] px-1.5 py-0">
                    Bu Ürün
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total & Button - Mobile */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t">
          <div>
            <p className="text-xs text-muted-foreground">
              {selectedItems.length} ürün toplam
            </p>
            {totalOriginalPrice > totalPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(totalOriginalPrice)}
              </p>
            )}
            <p className="text-xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </p>
          </div>
          
          <Button className="gap-2" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            Sepete Ekle
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-wrap items-center gap-4">
        {allProducts.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3">
            {index > 0 && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
            )}
            
            <div 
              className={cn(
                'relative p-3 border-2 rounded-xl cursor-pointer transition-all',
                selectedProducts.includes(product.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted/30 hover:border-muted'
              )}
              onClick={() => toggleProduct(product.id)}
            >
              <div className="absolute top-2 right-2 z-10">
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  disabled={product.id === mainProduct.id}
                  className="h-5 w-5"
                />
              </div>
              
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-white mb-2 relative">
                <Image
                  src={resolveMediaUrl(product.images[0]?.url || '/placeholder.svg')}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                  {product.brand}
                </p>
                <p className="text-sm font-semibold text-primary">
                  {formatPrice(product.price)}
                </p>
                {product.original_price && product.original_price > product.price && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </p>
                )}
              </div>
              
              {product.id === mainProduct.id && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-xs">
                  Bu Ürün
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {/* Total & Add to Cart - Desktop */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {selectedItems.length} ürün toplam
            </p>
            {totalOriginalPrice > totalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(totalOriginalPrice)}
              </p>
            )}
            <p className="text-2xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </p>
          </div>
          
          <Button size="lg" className="gap-2" onClick={handleAddToCart}>
            <ShoppingCart className="h-5 w-5" />
            Sepete Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}

