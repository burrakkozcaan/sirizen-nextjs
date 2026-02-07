"use client";

import { useState } from 'react';
import { Bell, BellOff, TrendingDown, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { usePriceAlert } from '@/contexts/PriceAlertContext';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface PriceAlertModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PriceAlertModal({ product, open, onOpenChange }: PriceAlertModalProps) {
  const { addAlert, hasAlert, removeAlert, getAlert } = usePriceAlert();
  const existingAlert = getAlert(product.id);
  
  const [targetPrice, setTargetPrice] = useState(
    existingAlert?.targetPrice || Math.floor(product.price * 0.9)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const minPrice = Math.floor(product.price * 0.5);
  const maxPrice = Math.floor(product.price * 0.99);
  const discount = Math.round(((product.price - targetPrice) / product.price) * 100);

  const handleSetAlert = () => {
    addAlert({
      productId: product.id,
      productName: product.name || product.title || '',
      productImage: product.images[0]?.url || '',
      targetPrice,
      currentPrice: product.price,
    });
    toast.success('Fiyat alarmı oluşturuldu!', {
      description: `${formatPrice(targetPrice)} ve altına düştüğünde bildirim alacaksınız.`,
    });
    onOpenChange(false);
  };

  const handleRemoveAlert = () => {
    removeAlert(product.id);
    toast.info('Fiyat alarmı kaldırıldı');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Fiyat Alarmı Kur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Preview */}
          <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
            <img
              src={product.images[0]?.url || 'https://placehold.co/80x80'}
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary uppercase">{typeof product.brand === 'string' ? product.brand : product.brand?.name || ''}</p>
              <p className="text-sm font-medium line-clamp-2">{product.name}</p>
              <p className="text-lg font-bold text-primary mt-1">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          {/* Target Price Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Hedef Fiyat</Label>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">%{discount} indirim</span>
              </div>
            </div>
            
            <Slider
              value={[targetPrice]}
              onValueChange={([value]) => setTargetPrice(value)}
              min={minPrice}
              max={maxPrice}
              step={10}
              className="py-4"
            />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>

            {/* Price Input */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                min={minPrice}
                max={maxPrice}
                className="text-center text-lg font-bold"
              />
              <span className="text-muted-foreground">TL</span>
            </div>
          </div>

          {/* Quick Options */}
          <div className="flex flex-wrap gap-2">
            {[10, 20, 30, 40].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                size="sm"
                onClick={() => setTargetPrice(Math.floor(product.price * (1 - percent / 100)))}
                className={targetPrice === Math.floor(product.price * (1 - percent / 100)) ? 'border-primary' : ''}
              >
                %{percent} düşerse
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {hasAlert(product.id) ? (
              <>
                <Button variant="outline" className="flex-1" onClick={handleRemoveAlert}>
                  <BellOff className="h-4 w-4 mr-2" />
                  Alarmı Kaldır
                </Button>
                <Button className="flex-1" onClick={handleSetAlert}>
                  <Bell className="h-4 w-4 mr-2" />
                  Güncelle
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={handleSetAlert}>
                <Bell className="h-4 w-4 mr-2" />
                Fiyat Alarmı Kur
              </Button>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Fiyat {formatPrice(targetPrice)} ve altına düştüğünde bildirim alacaksınız.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
