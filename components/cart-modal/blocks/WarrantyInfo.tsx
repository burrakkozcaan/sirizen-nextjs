'use client';

import { Shield } from 'lucide-react';

interface WarrantyInfoProps {
  show?: boolean;
}

export function WarrantyInfo({ show = true }: WarrantyInfoProps) {
  if (!show) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
      <div>
        <p className="text-sm font-medium text-gray-900">2 Yıl Garanti</p>
        <p className="text-xs text-gray-500">
          Üretici garantisi kapsamındadır. Detaylar için satıcıya danışın.
        </p>
      </div>
    </div>
  );
}
