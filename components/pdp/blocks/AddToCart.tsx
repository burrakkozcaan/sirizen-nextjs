'use client';

import { useState } from 'react';
import { ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import type { Product } from '@/types/pdp';

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    // TODO: Implement cart API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Adet</span>
        <div className="flex items-center rounded-lg border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-gray-50"
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="p-3 hover:bg-gray-50"
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-gray-500">{product.stock} adet stokta</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isLoading || product.stock === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 py-4 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-5 w-5" />
          {isLoading ? 'Ekleniyor...' : 'Sepete Ekle'}
        </button>
        <button className="flex items-center justify-center rounded-xl border border-gray-200 p-4 text-gray-600 transition hover:bg-gray-50 hover:text-red-500">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Delivery Info */}
      <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
        <p className="font-medium">Ücretsiz Kargo</p>
        <p className="text-green-600">100 TL ve üzeri siparişlerde</p>
      </div>
    </div>
  );
}
