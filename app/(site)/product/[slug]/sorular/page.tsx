import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductCore } from "@/actions/pdp.actions";
import { ProductQuestionsClient } from "./ProductQuestionsClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Ürün Soruları",
  description: "Ürün soru ve cevapları",
};

export default async function ProductQuestionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const corePromise = getProductCore(slug);

  return (
    <Suspense fallback={<ProductQuestionsSkeleton />}>
      <ProductQuestionsContent corePromise={corePromise} slug={slug} />
    </Suspense>
  );
}

async function ProductQuestionsContent({
  corePromise,
  slug,
}: {
  corePromise: ReturnType<typeof getProductCore>;
  slug: string;
}) {
  const core = await corePromise;

  if (!core) {
    notFound();
  }

  return <ProductQuestionsClient core={core} slug={slug} />;
}

function ProductQuestionsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <Skeleton className="h-6 w-64 mb-4" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-24 w-full mb-6" />
      </div>
    </div>
  );
}

