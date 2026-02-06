'use client';

import { Truck, Clock, Shield } from 'lucide-react';

export function DeliveryInfo() {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-gray-900">Teslimat Bilgisi</h3>
      
      <div className="flex items-start gap-3">
        <Truck className="mt-0.5 h-5 w-5 text-orange-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">Ücretsiz Kargo</p>
          <p className="text-xs text-gray-500">100 TL ve üzeri siparişlerde</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-5 w-5 text-orange-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">Hızlı Teslimat</p>
          <p className="text-xs text-gray-500">1-3 iş günü içinde kargoda</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Shield className="mt-0.5 h-5 w-5 text-orange-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">Güvenli Alışveriş</p>
          <p className="text-xs text-gray-500">14 gün içinde iade garantisi</p>
        </div>
      </div>
    </div>
  );
}
