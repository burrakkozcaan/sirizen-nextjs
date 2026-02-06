"use client";

"use client";

import { useState } from "react";
import { Clock, MapPin, Calendar, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationSelectorModal } from "./LocationSelectorModal";
import { api } from "@/lib/api";

interface DeliveryInfoBoxProps {
  productId?: number;
  dispatchDays?: number;
  shippingType?: 'normal' | 'express' | 'same_day';
  onShowOtherSellers?: () => void;
  hasFasterSellers?: boolean;
}

interface Location {
  city: string;
  district: string;
  cityId: number;
  districtId: number;
}

interface DeliveryEstimate {
  estimated_delivery_date: string;
  business_days: number;
  dispatch_days?: number;
  shipping_days?: number;
  shipping_type?: 'normal' | 'express' | 'same_day';
  formatted_date: string;
}

export function DeliveryInfoBox({ 
  productId, 
  dispatchDays, 
  shippingType,
  onShowOtherSellers,
  hasFasterSellers = false
}: DeliveryInfoBoxProps) {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        city_id: location.cityId.toString(),
        district_id: location.districtId.toString(),
      });
      if (productId) {
        params.append('product_id', productId.toString());
      }
      
      const response = await api.get<{ data: DeliveryEstimate }>(
        `/locations/estimate?${params.toString()}`
      );
      const estimateData = response.data || (response as any).data?.data;
      
      if (estimateData) {
        setDeliveryEstimate(estimateData);
      } else {
        // Fallback
        const fallbackDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        setDeliveryEstimate({
          estimated_delivery_date: fallbackDate.toISOString(),
          business_days: 2,
          formatted_date: fallbackDate.toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }),
        });
      }
    } catch (error) {
      console.error('Error fetching delivery estimate:', error);
      // Fallback on error
      const fallbackDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      setDeliveryEstimate({
        estimated_delivery_date: fallbackDate.toISOString(),
        business_days: 2,
        formatted_date: fallbackDate.toLocaleDateString('tr-TR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border p-4 space-y-3">
        {/* Time to ship */}
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Tahmini Kargoya Teslim:</p>
            <p className="text-sm text-success font-semibold">
              {dispatchDays === 0 
                ? 'Bugün kargoda' 
                : dispatchDays === 1 
                ? '1 gün içinde kargoda'
                : `${dispatchDays} gün içinde kargoda`}
            </p>
            {shippingType === 'same_day' && (
              <p className="text-xs text-muted-foreground mt-1">
                Aynı gün kargo (Saat 14:00'a kadar)
              </p>
            )}
          </div>
        </div>

        {/* Delivery estimate */}
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            {selectedLocation && deliveryEstimate ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">
                    {selectedLocation.district}, {selectedLocation.city}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-primary text-xs"
                    onClick={() => setLocationModalOpen(true)}
                  >
                    Değiştir
                  </Button>
                </div>
                <p className="text-sm font-medium">Tahmini Teslim:</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-primary font-bold capitalize">
                    {deliveryEstimate.formatted_date}
                  </span>
                  <span className="text-success font-medium">kapında!</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Konumunu seç, teslimat tarihini öğren!</p>
                  <p className="text-xs text-muted-foreground">
                    İl ve ilçe seçerek tahmini teslimat tarihini görebilirsiniz
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary shrink-0"
                  onClick={() => setLocationModalOpen(true)}
                >
                  Konum Seç <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Fast delivery option */}
        {hasFasterSellers && onShowOtherSellers && (
          <button
            onClick={onShowOtherSellers}
            className="flex items-center gap-3 p-3 bg-success/5 rounded-lg border border-success/20 hover:bg-success/10 transition-colors w-full text-left cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Daha Hızlı Teslimat yapan satıcı var!</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
}

