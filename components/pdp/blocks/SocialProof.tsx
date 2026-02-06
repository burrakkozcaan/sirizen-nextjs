'use client';

import { useEffect, useState } from 'react';
import { Eye, ShoppingCart, TrendingUp } from 'lucide-react';
import type { SocialProof as SocialProofType } from '@/types/pdp';
import { pdpApi } from '@/services/pdpApi';

interface SocialProofProps {
  product: { slug: string };
  socialProof: SocialProofType | null;
}

const icons = {
  cart: ShoppingCart,
  view: Eye,
  sold: TrendingUp,
};

export function SocialProof({ product, socialProof: initialData }: SocialProofProps) {
  const [socialProof, setSocialProof] = useState(initialData);

  useEffect(() => {
    if (!product.slug) return;

    const interval = setInterval(async () => {
      try {
        const response = await pdpApi.getSocialProof(product.slug);
        if (response.success && response.data) {
          setSocialProof(response.data);
        }
      } catch (error) {
        console.error('Failed to refresh social proof:', error);
      }
    }, socialProof?.refresh_interval || 30000);

    return () => clearInterval(interval);
  }, [product.slug, socialProof?.refresh_interval]);

  if (!socialProof) return null;

  const Icon = icons[socialProof.type] || Eye;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${
        socialProof.color === 'orange'
          ? 'border-orange-200 bg-orange-50'
          : socialProof.color === 'green'
          ? 'border-green-200 bg-green-50'
          : 'border-blue-200 bg-blue-50'
      }`}
    >
      <Icon
        className={`h-5 w-5 ${
          socialProof.color === 'orange'
            ? 'text-orange-600'
            : socialProof.color === 'green'
            ? 'text-green-600'
            : 'text-blue-600'
        }`}
      />
      <span
        className={`text-sm font-medium ${
          socialProof.color === 'orange'
            ? 'text-orange-800'
            : socialProof.color === 'green'
            ? 'text-green-800'
            : 'text-blue-800'
        }`}
      >
        {socialProof.message}
      </span>
    </div>
  );
}
