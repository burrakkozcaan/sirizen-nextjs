import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCampaignBySlug, getCampaignProducts } from "@/actions/campaign.actions";
import { CampaignProductsClient } from "./CampaignProductsClient";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  
  if (!campaign) {
    return {
      title: "Kampanya Bulunamadı",
    };
  }

  return {
    title: `${campaign.title} - Bazaar Hub`,
    description: campaign.description || `${campaign.title} kampanyasındaki ürünleri keşfedin`,
  };
}

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const products = await getCampaignProducts(slug, 24);

  return (
    <Suspense fallback={<CampaignSkeleton />}>
      <CampaignProductsClient
        campaign={campaign}
        initialProducts={products}
        searchParams={resolvedSearchParams}
      />
    </Suspense>
  );
}

function CampaignSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-6 w-96" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}

