import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductCore, Pricing } from "@/actions/pdp.actions";
import { resolveMediaUrl } from "@/lib/media";
import { PDPCoreClient } from "./PDPCoreClient";

interface PDPCoreProps {
  corePromise: Promise<ProductCore | null>;
  pricingPromise?: Promise<Pricing | null>;
}

export function PDPCore({ corePromise, pricingPromise }: PDPCoreProps) {
  return (
    <Suspense fallback={<PDPCoreSkeleton />}>
      <PDPCoreContent corePromise={corePromise} pricingPromise={pricingPromise} />
    </Suspense>
  );
}

async function PDPCoreContent({ corePromise, pricingPromise }: PDPCoreProps) {
  const core = await corePromise;

  if (!core) {
    return null;
  }

  const pricing = pricingPromise ? await pricingPromise : null;

  return <PDPCoreClient core={core} pricing={pricing} />;
}

function PDPCoreSkeleton() {
  return (
    <>
      <Skeleton className="h-6 w-64 mb-4" />
      <Skeleton className="h-8 w-full mb-2" />
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="aspect-square w-full mb-6" />
      <Skeleton className="h-32 w-full mb-6" />
    </>
  );
}
