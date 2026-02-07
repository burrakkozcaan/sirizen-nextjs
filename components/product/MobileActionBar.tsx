"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface MobileActionBarProps {
  productId: number;
  variantId?: number | null;
  price: number;
  quantity?: number;
  isInStock?: boolean;
}

export function MobileActionBar({ 
  productId, 
  variantId, 
  price, 
  quantity = 1,
  isInStock = true 
}: MobileActionBarProps) {
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!isInStock) {
      toast.error("Ürün stokta yok");
      return;
    }

    // MobileActionBar requires product object, but we only have productId
    // This component needs to be updated to receive product prop
    toast.error("Ürün bilgisi eksik");
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-[60] flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">Toplam Fiyat</span>
        <span className="text-lg font-bold text-orange-600">
          {formatPrice(price)}
        </span>
      </div>
      <Button
        onClick={handleAddToCart}
        disabled={!isInStock}
        className="bg-orange-600 hover:bg-orange-700 text-white font-bold w-1/2 h-11 disabled:opacity-50"
      >
        Sepete Ekle
      </Button>
    </div>
  );
}

