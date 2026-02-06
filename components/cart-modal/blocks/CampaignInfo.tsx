'use client';

import { Tag } from 'lucide-react';
import type { CartModalData } from '@/types/cart-modal';

interface CampaignInfoProps {
  campaigns: CartModalData['campaigns'];
}

export function CampaignInfo({ campaigns }: CampaignInfoProps) {
  if (!campaigns || campaigns.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Kampanyalar
      </label>
      
      <div className="space-y-2">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2"
          >
            <Tag className="h-4 w-4 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">
                {campaign.name}
              </p>
              {campaign.discount_rate && (
                <p className="text-xs text-orange-600">
                  %{campaign.discount_rate} indirim
                </p>
              )}
            </div>
            {campaign.badge_text && (
              <span className="rounded bg-orange-200 px-2 py-1 text-xs font-semibold text-orange-800">
                {campaign.badge_text}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
