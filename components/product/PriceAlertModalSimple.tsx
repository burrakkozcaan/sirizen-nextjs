"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellOff, TrendingDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { usePriceAlert } from '@/contexts/PriceAlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PriceAlertModalSimpleProps {
  productId: number;
  currentPrice: number;
  productName?: string;
  productImage?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PriceAlertModal({
  productId,
  currentPrice,
  productName,
  productImage,
  open,
  onOpenChange,
}: PriceAlertModalSimpleProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const { addAlert, hasAlert, removeAlert, getAlert } = usePriceAlert();
  const existingAlert = getAlert(productId);
  
  // Check authentication when modal opens
  useEffect(() => {
    if (open && !isAuthenticated) {
      toast.error("Fiyat alarmı kurmak için lütfen giriş yapın");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      onOpenChange(false);
    }
  }, [open, isAuthenticated, router, onOpenChange]);
  
  // Validate currentPrice before using it
  // Check if currentPrice is a valid number and greater than 0
  const validCurrentPrice = (() => {
    // Handle different input types
    let numPrice: number;
    
    if (typeof currentPrice === 'string') {
      numPrice = parseFloat(currentPrice);
    } else if (typeof currentPrice === 'number') {
      numPrice = currentPrice;
    } else {
      return 0;
    }
    
    // Check if it's a valid number and greater than 0
    if (isNaN(numPrice) || numPrice <= 0 || !isFinite(numPrice)) {
      return 0;
    }
    
    return numPrice;
  })();
  
  const [targetPrice, setTargetPrice] = useState(
    existingAlert?.targetPrice || (validCurrentPrice > 0 ? Math.floor(validCurrentPrice * 0.9) : 0)
  );

  // Update targetPrice when modal opens or currentPrice changes
  useEffect(() => {
    if (open && validCurrentPrice > 0) {
      try {
        if (existingAlert && existingAlert.targetPrice > 0) {
          setTargetPrice(existingAlert.targetPrice);
        } else {
          const newTargetPrice = Math.floor(validCurrentPrice * 0.9);
          if (newTargetPrice > 0 && newTargetPrice < validCurrentPrice) {
            setTargetPrice(newTargetPrice);
          }
        }
      } catch (error) {
        console.error('Target price güncellenirken hata:', error);
      }
    }
  }, [open, validCurrentPrice, existingAlert]);

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      return '0,00 ₺';
    }
    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
      }).format(price);
    } catch (error) {
      return `${price.toFixed(2)} ₺`;
    }
  };

  const minPrice = validCurrentPrice > 0 ? Math.floor(validCurrentPrice * 0.5) : 0;
  const maxPrice = validCurrentPrice > 0 ? Math.floor(validCurrentPrice * 0.99) : 0;
  const discount = validCurrentPrice > 0 && targetPrice < validCurrentPrice
    ? Math.round(((validCurrentPrice - targetPrice) / validCurrentPrice) * 100)
    : 0;

  const handleSetAlert = () => {
    try {
      if (!isAuthenticated) {
        toast.error("Fiyat alarmı kurmak için lütfen giriş yapın");
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        onOpenChange(false);
        return;
      }
      
      if (validCurrentPrice <= 0) {
        toast.error("Geçerli bir fiyat bulunamadı. Lütfen sayfayı yenileyin.");
        return;
      }
      
      if (targetPrice <= 0 || targetPrice >= validCurrentPrice) {
        toast.error("Hedef fiyat mevcut fiyattan düşük olmalıdır.");
        return;
      }
      
      addAlert({
        productId,
        productName: productName || `Ürün #${productId}`,
        productImage: productImage || '',
        targetPrice,
        currentPrice: validCurrentPrice,
      });
      toast.success('Fiyat alarmı oluşturuldu!', {
        description: `${formatPrice(targetPrice)} ve altına düştüğünde bildirim alacaksınız.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Fiyat alarmı kurulurken hata:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleRemoveAlert = () => {
    try {
      removeAlert(productId);
      toast.info('Fiyat alarmı kaldırıldı');
      onOpenChange(false);
    } catch (error) {
      console.error('Fiyat alarmı kaldırılırken hata:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Fiyat Alarmı Kur
          </DialogTitle>
          <DialogDescription>
            Ürün fiyatı belirlediğiniz seviyeye düştüğünde size bildirim göndereceğiz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Price */}
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Mevcut Fiyat</p>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(validCurrentPrice)}
            </p>
          </div>

          {/* Target Price Slider */}
          {validCurrentPrice > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Hedef Fiyat</Label>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">%{discount} indirim</span>
                </div>
              </div>
              
              {minPrice < maxPrice && (
                <Slider
                  value={[Math.max(minPrice, Math.min(maxPrice, targetPrice))]}
                  onValueChange={([value]) => {
                    const clampedValue = Math.max(minPrice, Math.min(maxPrice, value));
                    setTargetPrice(clampedValue);
                  }}
                  min={minPrice}
                  max={maxPrice}
                  step={Math.max(1, Math.floor((maxPrice - minPrice) / 100))}
                  className="py-4"
                />
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatPrice(minPrice)}</span>
                <span>{formatPrice(maxPrice)}</span>
              </div>

              {/* Price Input */}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    if (newValue >= minPrice && newValue <= maxPrice) {
                      setTargetPrice(newValue);
                    }
                  }}
                  min={minPrice}
                  max={maxPrice}
                  className="text-center text-lg font-bold"
                />
                <span className="text-muted-foreground">TL</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-destructive/10 rounded-lg text-center">
              <p className="text-sm text-destructive">
                Fiyat bilgisi bulunamadı. Lütfen sayfayı yenileyin.
              </p>
            </div>
          )}

          {/* Quick Options */}
          {validCurrentPrice > 0 && (
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30, 40].map((percent) => {
                const calculatedPrice = Math.floor(validCurrentPrice * (1 - percent / 100));
                return (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    onClick={() => setTargetPrice(calculatedPrice)}
                    className={targetPrice === calculatedPrice ? 'border-primary bg-primary/5' : ''}
                  >
                    %{percent} düşerse
                  </Button>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {hasAlert(productId) ? (
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

