import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, UserPlus, ShoppingBag, Package, Tag, ChevronRight } from "lucide-react";
import type { ProductCampaigns } from "@/actions/pdp.actions";

interface PDPCampaignsProps {
  productId: number;
  campaignsPromise: Promise<ProductCampaigns>;
}

export function PDPCampaigns({
  productId,
  campaignsPromise,
}: PDPCampaignsProps) {
  return (
    <Suspense fallback={<PDPCampaignsSkeleton />}>
      <PDPCampaignsContent
        productId={productId}
        campaignsPromise={campaignsPromise}
      />
    </Suspense>
  );
}

async function PDPCampaignsContent({
  productId,
  campaignsPromise,
}: PDPCampaignsProps) {
  const campaigns = await campaignsPromise;

  // Combine all campaigns into a single array for display
  const allCampaigns: Array<{
    id: number;
    title: string;
    type: 'product_campaign' | 'coupon' | 'bundle';
    icon: 'package' | 'tag';
  }> = [];

  // Add product campaigns
  campaigns.product_campaigns.forEach((campaign) => {
    allCampaigns.push({
      id: campaign.id,
      title: campaign.title,
      type: 'product_campaign',
      icon: campaign.type === 'discount' ? 'tag' : 'package',
    });
  });

  // Add coupons as campaigns
  campaigns.coupons.forEach((coupon) => {
    allCampaigns.push({
      id: coupon.id,
      title: coupon.title,
      type: 'coupon',
      icon: 'tag',
    });
  });

  // Add bundles as campaigns
  campaigns.bundles.forEach((bundle) => {
    allCampaigns.push({
      id: bundle.id,
      title: bundle.title,
      type: 'bundle',
      icon: 'package',
    });
  });

  if (allCampaigns.length === 0) {
    return null;
  }

  return (
    <div className="my-6 space-y-3">
      <h3 className="font-semibold text-lg px-2 md:px-0">Ürünün Kampanyaları</h3>
      
      {allCampaigns.map((campaign) => (
        <button
          key={campaign.id}
          onClick={() => {
            // Handle campaign click - could open modal or navigate
            if (campaign.type === 'coupon') {
              // Copy coupon code if available
              console.log('Coupon clicked:', campaign.title);
            } else if (campaign.type === 'bundle') {
              // Show bundle details
              console.log('Bundle clicked:', campaign.title);
            } else {
              // Show campaign details
              console.log('Campaign clicked:', campaign.title);
            }
          }}
          className="w-full border border-gray-200 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 bg-white shadow-sm transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${campaign.icon === 'tag' ? 'bg-orange-100' : 'bg-gray-100'} rounded flex items-center justify-center ${campaign.icon === 'tag' ? 'text-primary' : 'text-gray-600'}`}>
              {campaign.icon === 'tag' ? (
                <Tag className="w-5 h-5" />
              ) : (
                <Package className="w-5 h-5" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">{campaign.title}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      ))}
    </div>
  );
}

function PDPCampaignsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}

