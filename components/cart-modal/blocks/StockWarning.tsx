'use client';

import { AlertTriangle } from 'lucide-react';
import type { CartModalData } from '@/types/cart-modal';

interface StockWarningProps {
  warning: CartModalData['stock_warning'];
  threshold?: number;
}

export function StockWarning({ warning, threshold = 5 }: StockWarningProps) {
  if (!warning) return null;

  const colors = {
    red: 'bg-red-50 text-red-800 border-red-200',
    orange: 'bg-orange-50 text-orange-800 border-orange-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${colors[warning.color as keyof typeof colors] || colors.orange}`}>
      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium">{warning.message}</span>
    </div>
  );
}
