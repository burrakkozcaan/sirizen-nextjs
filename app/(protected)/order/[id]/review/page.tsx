import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/order.actions";
import { OrderReviewClient } from "./OrderReviewClient";
import { OrderReviewSkeleton } from "./OrderReviewSkeleton";

export const metadata = {
  title: "Sipariş Değerlendirme",
  description: "Siparişinizi değerlendirin",
};

export default async function OrderReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <Suspense fallback={<OrderReviewSkeleton />}>
      <OrderReviewClient order={result.data} />
    </Suspense>
  );
}

