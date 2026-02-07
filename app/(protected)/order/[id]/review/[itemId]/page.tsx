import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/order.actions";
import { ItemReviewClient } from "./ItemReviewClient";
import { ItemReviewSkeleton } from "./ItemReviewSkeleton";

export const metadata = {
  title: "Ürün Değerlendirme",
  description: "Ürünü değerlendirin",
};

export default async function ItemReviewPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const result = await getOrderById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const item = result.data.items.find((i: { id: number }) => i.id === Number(itemId));
  if (!item) {
    notFound();
  }

  return (
    <Suspense fallback={<ItemReviewSkeleton />}>
      <ItemReviewClient order={result.data} item={item} />
    </Suspense>
  );
}

