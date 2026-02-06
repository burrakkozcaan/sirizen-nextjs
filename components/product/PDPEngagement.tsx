import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import type { Engagement } from "@/actions/pdp.actions";
import { AnimatedSocialProof } from "./AnimatedSocialProof";
import { PDPEngagementClient } from "./PDPEngagementClient";

interface PDPEngagementProps {
  productId: number;
  engagementPromise: Promise<Engagement | null>;
}

export function PDPEngagement({
  productId,
  engagementPromise,
}: PDPEngagementProps) {
  return (
    <Suspense fallback={<PDPEngagementSkeleton />}>
      <PDPEngagementContent
        productId={productId}
        engagementPromise={engagementPromise}
      />
    </Suspense>
  );
}

async function PDPEngagementContent({
  productId,
  engagementPromise,
}: PDPEngagementProps) {
  const engagement = await engagementPromise;

  if (!engagement) {
    return null;
  }

  return <PDPEngagementClient engagement={engagement} />;
}

function PDPEngagementSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
