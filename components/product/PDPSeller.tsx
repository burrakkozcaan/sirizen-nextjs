import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Truck, ShieldCheck, UserPlus, HelpCircle, Store, Info, ChevronRight } from "lucide-react";
import type { Seller, Engagement } from "@/actions/pdp.actions";
import { resolveMediaUrl } from "@/lib/media";

interface PDPSellerProps {
  sellerId: number;
  sellerPromise: Promise<Seller | null>;
  engagementPromise?: Promise<Engagement | null>;
}

export function PDPSeller({ sellerId, sellerPromise, engagementPromise }: PDPSellerProps) {
  return (
    <Suspense fallback={<PDPSellerSkeleton />}>
      <PDPSellerContent 
        sellerId={sellerId} 
        sellerPromise={sellerPromise} 
        engagementPromise={engagementPromise} 
      />
    </Suspense>
  );
}

async function PDPSellerContent({
  sellerId,
  sellerPromise,
  engagementPromise,
}: PDPSellerProps) {
  const [seller, engagement] = await Promise.all([
    sellerPromise,
    engagementPromise || Promise.resolve(null),
  ]);
  const qaCount = engagement?.qa_count;

  if (!seller) {
    return null;
  }

  // Format follower count
  const followerCountFormatted = seller.follower_count >= 1000
    ? `${(seller.follower_count / 1000).toFixed(1).replace('.0', '')}B`
    : seller.follower_count.toLocaleString();

  return (
    <div className="border border-[#e6e6e6] rounded-lg p-2 pb-8 space-y-1.5 relative">
      {/* Header - Trendyol Style */}
      <div className="bg-[#ebf5ff] rounded px-3 py-2 space-y-0.5">
        <div className="flex items-center justify-between">
          <Link href={`/store/${seller.slug}`} className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-sm font-semibold truncate">{seller.name}</span>
              {seller.is_official && (
                <Image
                  src="/images/official-seller-badge.png"
                  alt="Yetkili Satıcı"
                  width={14}
                  height={14}
                  className="flex-shrink-0"
                />
              )}
              <Badge
                className="text-xs font-semibold px-1.5 py-0 h-4 bg-[#08b449] text-white"
                style={{ backgroundColor: '#08b449' }}
              >
                {Number(seller.rating || 0).toFixed(1)}
              </Badge>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-auto">
                <Info className="w-3 h-3" />
              </Button>
            </div>
          </Link>
        </div>
        <div className="text-sm font-semibold text-foreground">
          {followerCountFormatted} Takipçi
        </div>
      </div>

      {/* Follow Button */}
      {!seller.is_following && (
        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
          <UserPlus className="w-3 h-3 mr-1.5" />
          Takip Et Kazan
        </Button>
      )}

      {/* Seller Questions Button */}
      <Link href={`#qa-section`}>
        <Button variant="ghost" size="sm" className="w-full h-8 text-xs justify-start">
          <HelpCircle className="w-3 h-3 mr-1.5" />
          Satıcı Soruları {qaCount !== undefined && qaCount > 0 && `(${qaCount})`}
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
      </Link>

      {/* Go to Store Button - Absolute positioned */}
      <Link href={`/store/${seller.slug}`} className="block">
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-[180px] h-8 text-xs font-semibold tracking-wider bg-[#f5f5f5] hover:bg-[#e6e6e6] border-none rounded-full"
        >
          MAĞAZAYA GİT
          <ChevronRight className="w-3 h-3 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function PDPSellerSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-6 w-full" />
    </div>
  );
}

